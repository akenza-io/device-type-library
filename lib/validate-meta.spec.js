const glob = require("glob");
const fs = require("fs");
const Ajv = require("ajv");
const chai = require("chai");

const { assert } = chai;

function loadRemoteSchema(uri) {
  return axios.get(uri).then((res) => {
    if (res.status >= 400) {
      throw new Error(`Schema loading error: ${res.statusCode}`);
    }
    return res.data;
  });
}

let metaSchema = null;
before((done) => {
  fs.readFile(`${__dirname}/meta.schema.json`, "utf8", (err, fileContents) => {
    if (err) throw err;
    metaSchema = JSON.parse(fileContents);
    done();
  });
});

const validateMeta = (filepath) =>
  new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", (err, fileContents) => {
      if (err) {
        reject(err);
      } else {
        const schema = JSON.parse(fileContents);
        const ajv = new Ajv();
        const validate = ajv.compile(metaSchema);
        const valid = validate(schema);

        // Validates the meta and checks for missing topics
        const topics = schema.outputTopics;
        const folder = filepath.replace("meta.json", "");
        const schemas = fs.readdirSync(folder);

        schemas.forEach((schemaName) => {
          if (schemaName.includes(".schema.json")) {
            const topic = schemaName.replace(".schema.json", "");
            if (!topics.includes(topic)) {
              assert.fail(`Missing topic in ${schema.name} meta: ${topic}`);
              /*
              // Colored output without stopping script execution
              console.log(
                `\u001b[${31}m` +
                  `Missing topic in ${schema.name} meta: ${topic}` +
                  "\u001b[0m",
              );
              */
            }
          }
        });

        resolve({
          isValid: valid,
          filepath,
          errors: validate.errors,
        });
      }
    });
  });

describe("validate meta.json files", () => {
  it("should validate meta files", (done) => {
    const options = { absolute: true };
    glob("**/meta.json", options, (err, files) => {
      const promises = [];
      files.forEach((file) => {
        promises.push(validateMeta(file));
      });
      Promise.all(promises).then((values) => {
        values.forEach((result) => {
          if (!result.isValid) {
            console.log(result.errors);
          }
          assert.isTrue(result.isValid, `${result.filepath} is invalid}`);
        });

        done();
      });
    });
  });
});
