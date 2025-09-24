import { glob } from "glob";
import { readFile, readFileSync } from "fs";
import Ajv from "ajv";
import { assert } from "chai";
import axios from "axios";
import { Agent } from 'node:https';


const client = axios.create({
  timeout: 30_000,
  httpsAgent: new Agent({
    keepAlive: true,
  }),
});

let exclude = null;
before((done) => {
  readFile(`${process.cwd()}/lib/exclude.json`, "utf8", (err, fileContents) => {
    if (err) throw err;
    exclude = JSON.parse(fileContents);
    done();
  });
});

function loadRemoteSchema(uri) {
  return client
    .get(uri)
    .catch((e) => {
      console.log(`error while loading schema from ${uri} with error ${e}`);
    })
    .then((res) => {
      if (res.status >= 400) {
        throw new Error(`Schema loading error: ${res.status} - ${res.statusText}`);
      }
      return res.data;
    })
}

function loadLocalSchema(uri) {
  return new Promise((resolve, reject) => {
    try {
      const localBasePath = process.cwd();
      const localSchemaPath = `${localBasePath}${uri.substring(uri.indexOf("/data-models"))}`;

      const uriParts = localSchemaPath.split("#");
      const schemaUri = uriParts[0];
      const res = readFileSync(schemaUri, "utf8")
      const schema = JSON.parse(res);

      resolve(schema);
    } catch (error) {
      reject(error);
    }
  })
}

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
    readFile(filepath, "utf8", (err, fileContents) => {
      if (err) {
        reject(err);
      } else {
        const schema = JSON.parse(fileContents);
        let ajv;

        if (process.env.TEST_MODE === "LOCAL") {
          ajv = new Ajv({
            allErrors: true,
            strictSchema: "log",
            loadSchema: loadLocalSchema,
          });
        } else {
          ajv = new Ajv({
            allErrors: true,
            strictSchema: "log",
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

        ajv.compileAsync(schema)
          .then(validate => {
            resolve({ isValid: true, filepath });
          }).catch(err => {
            console.log(err);
            resolve({ isValid: false, filepath, errors: err.errors });
          })
      }
    });
  });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("validate schemas", () => {
  it("should validate all schemas", async () => {
    const options = { absolute: true, sync: true, ignore: "node_modules/**" };
    const files = await glob("types/**/*schema.json", options);
    const values = [];

    for (const file of files) {
      try {
        const result = await validateSchema(file);
        values.push(result);
      } catch (err) {
        console.error(`Error validating file ${file}:`, err.message);
      }

      // serial processing and waiting between schema validation
      // axios might otherwise be overwhelmed, or we could run into rate limits from GitHub...
      // see https://github.com/axios/axios/issues/2997 or https://stackoverflow.com/questions/63064393/getting-axios-error-connect-etimedout-when-making-high-volume-of-calls
      if (process.env.TEST_MODE !== "LOCAL") {
        await delay(25);
      }
    }

    values.forEach((result) => {
      if (!result.isValid) {
        console.log(result.errors);
      }

      assert.isTrue(
        result.isValid,
        `${result.filepath} is invalid ${JSON.stringify(result.errors)}`,
      );
    });
  }).timeout(200_000);
});
