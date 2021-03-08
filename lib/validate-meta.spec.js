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

var metaSchema = null;
before(function (done) {
  fs.readFile(
    __dirname + "/meta.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      metaSchema = JSON.parse(fileContents);
      done();
    }
  );
});

const validateMeta = (filepath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, "utf8", function (err, fileContents) {
      if (err) {
        reject(err);
      } else {
        var schema = JSON.parse(fileContents);
        const ajv = new Ajv();
        const validate = ajv.compile(metaSchema);
        const valid = validate(schema);
        resolve({
          isValid: valid,
          filepath: filepath,
          errors: validate.errors,
        });
      }
    });
  });
};

describe("validate meta.json files", function () {
  it("should validate meta files", function (done) {
    const options = { absolute: true };
    glob("**/meta.json", options, function (err, files) {
      var promises = [];
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
