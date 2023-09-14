const glob = require("glob");
const fs = require("fs");
const Ajv = require("ajv");
const chai = require("chai");
const axios = require("axios");

const { assert } = chai;

function loadRemoteSchema(uri) {
  const client = axios.create({
    timeout: 3000,
  });

  return client
    .get(uri)
    .catch((e) => {
      console.log(`error while loading schema from ${uri} with error ${e}`);
    })
    .then((res) => {
      if (res.status >= 400) {
        throw new Error(`Schema loading error: ${res.statusCode}`);
      }
      return res.data;
    });
}

const dataKeyTopicRegex = /^[a-zA-Z]([a-zA-Z0-9]+|\.|_)*[a-zA-Z0-9]$/;
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
    fs.readFile(filepath, "utf8", (err, fileContents) => {
      if (err) {
        reject(err);
      } else {
        const schema = JSON.parse(fileContents);
        const ajv = new Ajv({
          allErrors: true,
          loadSchema: loadRemoteSchema,
        });

        const keyErrors = [];
        validateTopic(filepath, keyErrors, schema.topic);
        validateProcessingType(filepath, keyErrors, schema.processingType);
        validateSchemaKeys(keyErrors, schema);
        if (keyErrors.length > 0) {
          resolve({ isValid: false, filepath, errors: keyErrors });
          return;
        }

        ajv.compileAsync(schema, (compileErr) => {
          if (compileErr) {
            resolve({ isValid: false, filepath, errors: ajv.errors });
          } else {
            resolve({ isValid: true, filepath });
          }
        });
      }
    });
  });

describe("validate schemas", () => {
  it("should validate all schemas", async () => {
    const options = { absolute: true, sync: true, ignore: "node_modules/**" };
    const files = glob("types/**/*schema.json", options);
    const promises = [];
    files.forEach((file) => {
      promises.push(validateSchema(file));
    });
    const values = await Promise.all(promises);

    values.forEach((result) => {
      if (!result.isValid) {
        console.log(result.errors);
      }

      assert.isTrue(result.isValid, `${result.filepath} is invalid`);
    });
  }).timeout(200000);
});
