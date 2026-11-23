import { glob } from "glob";
import { readFile as readFileCallback } from "fs";
import { readFile } from "fs/promises";
import Ajv from "ajv";
import { assert } from "chai";
import axios from "axios";
import { Agent } from 'node:https';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = axios.create({
  timeout: 30_000,
  httpsAgent: new Agent({
    keepAlive: true,
  }),
});

let exclude = null;
before((done) => {
  readFileCallback(`${__dirname}/exclude.json`, "utf8", (err, fileContents) => {
    if (err) throw err;
    exclude = JSON.parse(fileContents);
    done();
  });
});

// Caches the pending promise rather than the result, so schemas validated in parallel
// share a single read or download per data-model file
const schemaCache = new Map();

function loadRemoteSchema(uri) {
  if (!schemaCache.has(uri)) {
    console.log(`loading schema ${uri}`);
    schemaCache.set(
      uri,
      client
        .get(uri)
        .then((res) => res.data)
        .catch((e) => {
          throw new Error(`Schema loading error for ${uri}: ${e.message}`);
        }),
    );
  }

  return schemaCache.get(uri);
}

function loadLocalSchema(uri) {
  const localSchemaPath = `${process.cwd()}${uri.substring(uri.indexOf("/data-models"))}`.split("#")[0];
  if (!schemaCache.has(localSchemaPath)) {
    schemaCache.set(
      localSchemaPath,
      readFile(localSchemaPath, "utf8").then((contents) => JSON.parse(contents)),
    );
  }

  return schemaCache.get(localSchemaPath);
}

// Walks a JSON Pointer fragment (e.g. "/$defs/temperature/celsius") through a schema object.
function resolveJsonPointer(schema, pointer) {
  if (!pointer) return schema;
  const parts = pointer.replace(/^\//, "").split("/");
  return parts.reduce((obj, part) => (obj !== undefined ? obj[part] : undefined), schema);
}

// Loads the base schema file and navigates to the fragment, honouring TEST_MODE.
async function resolveRef(ref) {
  const hashIndex = ref.indexOf("#");
  const baseUri = hashIndex >= 0 ? ref.slice(0, hashIndex) : ref;
  const fragment = hashIndex >= 0 ? ref.slice(hashIndex + 1) : "";
  const schema =
    process.env.TEST_MODE === "LOCAL"
      ? await loadLocalSchema(baseUri)
      : await loadRemoteSchema(baseUri);
  return resolveJsonPointer(schema, fragment);
}

// Keys akenza always takes from the referenced data-model definition, even when defined locally.
const refOverrideKeys = ["type", "unit", "measurementType"];

// Device type schema properties may use $ref alongside sibling keywords (minimum, maximum, …) to
// override or extend a shared data-model definition. JSON Schema Draft-7 does not support this
// natively — $ref makes Ajv ignore siblings, causing strictTypes errors. We pre-process the
// schema here to replicate akenza's own merge behaviour: the remote definition is used as
// the base, locally defined keys take precedence except for the refOverrideKeys, producing a
// self-contained property object that Ajv can validate without needing to resolve the ref itself.
async function mergeSchemaRefs(errors, schema) {
  if (!schema.properties) return schema;

  const entries = await Promise.all(
    Object.entries(schema.properties).map(async ([key, prop]) => {
      if (!prop.$ref) return [key, prop];
      const resolved = await resolveRef(prop.$ref);
      // a ref must point to a single measurement type unit, e.g. #/$defs/pulseInput/count, not #/$defs/pulseInput
      if (resolved === undefined || resolved.type === undefined) {
        errors.push(`dataKey '${key}': $ref ${prop.$ref} does not point to a measurement type with a type`);
        return [key, prop];
      }

      if (prop.type !== undefined && prop.type !== resolved.type) {
        errors.push(`dataKey '${key}': type '${prop.type}' is overridden by type '${resolved.type}' of $ref ${prop.$ref}`);
      }

      const localOverrides = Object.fromEntries(Object.entries(prop).filter(([k]) => k !== "$ref"));
      const merged = { ...resolved, ...localOverrides };
      refOverrideKeys.forEach((k) => {
        if (resolved[k] === undefined) {
          delete merged[k];
        } else {
          merged[k] = resolved[k];
        }
      });

      return [key, merged];
    }),
  );

  return { ...schema, properties: Object.fromEntries(entries) };
}

// The akenza platform parses each (merged) property into a typed measurement type: integer keywords
// into 32-bit ints, number keywords into floats and enum values into the property type. Properties
// that do not fit make the platform skip the whole device type during the library sync.
const propertyTypes = ["boolean", "integer", "number", "string", "array", "object"];
const numericKeywords = ["multipleOf", "maximum", "exclusiveMaximum", "minimum", "exclusiveMinimum"];
const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const isInt32 = (value) => Number.isInteger(value) && value >= -(2 ** 31) && value <= 2 ** 31 - 1;

const validatePlatformTypes = (errors, schema) => {
  Object.entries(schema.properties ?? {}).forEach(([key, prop]) => {
    if (!propertyTypes.includes(prop.type)) {
      errors.push(`dataKey '${key}': type ${JSON.stringify(prop.type)} is not one of ${propertyTypes}`);
      return;
    }

    const valueCheck = { integer: isInt32, number: isNumber, string: (value) => typeof value === "string" }[prop.type];
    if (valueCheck === undefined) {
      return;
    }

    if (prop.type !== "string") {
      numericKeywords
        .filter((keyword) => prop[keyword] !== undefined && !valueCheck(prop[keyword]))
        .forEach((keyword) => errors.push(`dataKey '${key}': ${keyword} ${prop[keyword]} is not a valid ${prop.type === "integer" ? "32-bit integer" : "number"}`));
    }

    if (Array.isArray(prop.enum) && !prop.enum.every(valueCheck)) {
      errors.push(`dataKey '${key}': enum ${JSON.stringify(prop.enum)} does not match type '${prop.type}'`);
    }
  });
};

const dataKeyTopicRegex = /^[a-zA-Z]([a-zA-Z0-9]+|\.|_)*[a-zA-Z0-9]$/; // Legal in Akenza
const dataKeyRegex = /_/gm; // No underscores in datakeys
const dataTopicRegex = /^[a-zA-Z]+([A-Z][a-z]+)+$/gm; // No camelcase in topics
const dataKeyTopicMinLength = 0;
const dataKeyTopicMaxLength = 64;
const validatePropertyName = (errors, dataKey) => {
  if (dataKey.length < dataKeyTopicMinLength) {
    errors.push(`dataKey '${dataKey}' too short`);
  }

  if (dataKey.length > dataKeyTopicMaxLength) {
    errors.push(`dataKey '${dataKey}' too long`);
  }

  if (!dataKeyTopicRegex.test(dataKey)) {
    errors.push(`dataKey '${dataKey}' does not match convention`);
  }

  if (dataKeyRegex.test(dataKey) && !exclude.dataKeys.includes(dataKey)) {
    errors.push(`dataKey '${dataKey}' uses an underscore`);
  }
};

const validateTopic = (filepath, errors, topic) => {
  if (topic === undefined) {
    errors.push(`topic not set for ${filepath}`);
    return;
  }

  if (topic.length < dataKeyTopicMinLength) {
    errors.push(`topic '${topic}' too short`);
  }

  if (topic.length > dataKeyTopicMaxLength) {
    errors.push(`topic '${topic}' too long`);
  }

  if (!dataKeyTopicRegex.test(topic)) {
    errors.push(`topic '${topic}' does not match convention`);
  }

  if (dataTopicRegex.test(topic) && !exclude.topics.includes(topic)) {
    errors.push(`topic '${topic}' uses camelcase`);
  }
};

const validateProcessingType = (filepath, errors, processingType) => {
  if (processingType === undefined) {
    errors.push(`processingType not set for ${filepath}`);
    return;
  }

  if (
    processingType !== "uplink_decoder" &&
    processingType !== "downlink_encoder"
  ) {
    errors.push(
      `processingType not one of ['uplink_decoder', 'downlink_encoder' for ${filepath}`,
    );
  }
};

const validateSchemaProperties = (errors, schema) => {
  if (schema === undefined) {
    return;
  }

  const schemaKeys = Object.keys(schema);
  const allowedProperties = [
    "unit",
    "$ref",
    "title",
    "type",
    "description",
    "properties",
    "required",
    "examples",
    "hideFromKpis",
    "counterType",
    "minimum",
    "maximum",
    "pattern",
    "uniqueItems",
    "default",
    "enum",
    "items",
  ];

  const notAllowedProperties = schemaKeys.filter(
    (property) => !allowedProperties.includes(property),
  );
  if (notAllowedProperties.length > 0) {
    errors.push(
      notAllowedProperties.map((prop) => `${prop} is not allowed in schema`),
    );
  }

  if (schema.properties !== undefined) {
    Object.keys(schema.properties).forEach((property) => {
      validatePropertyName(errors, property);
      validateSchemaProperties(errors, schema.properties[property]);
    });
  }

  // Check if required properties are set
  if (!(schemaKeys.includes("title") && schemaKeys.includes("description") && schemaKeys.includes("type"))) {
    if (!schemaKeys.includes("$ref")) {
      errors.push(`Either title, description or type is not defined`);
    }
  }
};

const validateSchemaKeys = (errors, schema) => {
  if (schema === undefined) {
    return;
  }

  const schemaKeys = Object.keys(schema);
  const allowedProperties = [
    "$id",
    "$schema",
    "title",
    "type",
    "topic",
    "description",
    "processingType",
    "properties",
    "required",
    "examples",
  ];

  const notAllowedProperties = schemaKeys.filter(
    (property) => !allowedProperties.includes(property),
  );
  if (notAllowedProperties.length > 0) {
    errors.push(
      notAllowedProperties.map((prop) => `${prop} is not allowed in schema`),
    );
  }

  if (schema.properties !== undefined) {
    Object.keys(schema.properties).forEach((property) => {
      validatePropertyName(errors, property);
      validateSchemaProperties(errors, schema.properties[property]);
    });
  }
};

const validateSchema = (filepath) =>
  new Promise((resolve, reject) => {
    readFileCallback(filepath, "utf8", (err, fileContents) => {
      if (err) {
        reject(err);
      } else {
        const schema = JSON.parse(fileContents);
        let ajv;

        if (process.env.TEST_MODE === "LOCAL") {
          ajv = new Ajv({
            allErrors: true,
            strictSchema: false,
            loadSchema: loadLocalSchema,
          });
        } else {
          ajv = new Ajv({
            allErrors: true,
            strictSchema: false,
            loadSchema: loadRemoteSchema,
          });
        }

        const keyErrors = [];
        validateTopic(filepath, keyErrors, schema.topic);
        validateProcessingType(filepath, keyErrors, schema.processingType);
        validateSchemaKeys(keyErrors, schema);
        if (keyErrors.length > 0) {
          resolve({ isValid: false, filepath, errors: keyErrors });
          return;
        }

        const platformErrors = [];
        mergeSchemaRefs(platformErrors, schema)
          .then((mergedSchema) => {
            validatePlatformTypes(platformErrors, mergedSchema);
            if (platformErrors.length > 0) {
              throw { errors: platformErrors };
            }

            return ajv.compileAsync(mergedSchema);
          })
          .then(() => {
            resolve({ isValid: true, filepath });
          })
          .catch((err) => {
            console.log(err);
            resolve({ isValid: false, filepath, errors: err.errors });
          });
      }
    });
  });

describe("validate schemas", () => {
  it("should validate all schemas", async () => {
    const options = { absolute: true, sync: true, ignore: "node_modules/**" };
    const files = await glob("types/**/*schema.json", options);

    // validated in parallel: the schema cache keeps this at one request per data-model file
    const values = await Promise.all(
      files.map((file) =>
        validateSchema(file).catch((err) => ({ isValid: false, filepath: file, errors: [err.message] })),
      ),
    );

    // report all invalid schemas at once instead of stopping at the first one
    const invalid = values.filter((result) => !result.isValid);
    assert.isEmpty(
      invalid,
      invalid.map((result) => `${result.filepath} is invalid ${JSON.stringify(result.errors)}`).join("\n"),
    );
  }).timeout(200_000);
});
