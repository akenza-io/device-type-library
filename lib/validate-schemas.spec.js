var glob = require("glob");
const fs = require("fs");
const Ajv = require("ajv");
const chai = require("chai");
const assert = chai.assert;

function loadRemoteSchema(uri) {
  return axios.get(uri).then(function (res) {
    if (res.status >= 400) {
      throw new Error("Schema loading error: " + res.statusCode);
    }
    return res.data;
  });
}

const validateSchema = (filepath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", function (err, fileContents) {
      if (err) {
        reject(err);
      } else {
        var schema = JSON.parse(fileContents);
        const ajv = new Ajv({
          allErrors: true,
          loadSchema: loadRemoteSchema,
        });
        ajv.compileAsync(schema, (err, validate) => {
          if (err) {
            resolve({ isValid: false, filepath: filepath, errors: ajv.errors });
          } else {
            resolve({ isValid: true, filepath: filepath });
          }
        });
      }
    });
  });
};

describe("validate schemas", function () {
  it("should validate all schemas", function (done) {
    const options = { absolute: true };
    glob("**/asd.schema.json", options, function (err, files) {
      var promises = [];
      files.forEach((file) => {
        promises.push(validateSchema(file));
      });
      Promise.all(promises).then((values) => {
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
