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
  it("should validate all schemas", (done) => {
    const options = { absolute: true, ignore: "node_modules/**" };
    glob("**/*schema.json", options, (err, files) => {
      if (err) {
        console.log(err);
      }
      const promises = [];
      files.forEach((file) => {
        promises.push(validateSchema(file));
      });
      Promise.all(promises)
        .catch((promiseErr) => {
          console.log(promiseErr);
        })
        .then((values) => {
          values.forEach((result) => {
            if (!result.isValid) {
              console.log(result.errors);
            }

            assert.isTrue(result.isValid, `${result.filepath} is invalid`);
          });

          done();
        });
    });
  });
});
