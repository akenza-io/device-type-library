const fs = require("fs");
const chai = require("chai");
const request = require("sync-request");

const { assert } = chai;
const bits = require("bits");

exports.loadSchema = (path) =>
  new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, fileContents) => {
      if (err) reject(err);
      const schema = JSON.parse(fileContents);
      resolve(schema);
    });
  });

let expectations = [];
exports.expectEmits = (callback) => {
  expectations.push((type, value) => {
    callback(type, value);
  });
};

exports.init = (script) => {
  expectations = [];
  const consume = script.__get__("consume");
  let nExpectation = 0;

  if (process.env.TEST_MODE === "INTEGRATION") {
    script.__set__({
      Bits: bits,
      emit(type, value) {
        if (nExpectation >= expectations.length) {
          throw new Error("not enough expecatations provided");
        }

        expectations[nExpectation](type, value);
        nExpectation += 1;
      },
    });
  }
  return (data) => {
    if (expectations.length <= 0) {
      throw new Error("at least one expectation must be set");
    }

    if (process.env.TEST_MODE === "INTEGRATION") {
      console.log("running in integration mode: calling script runner");
      // call script runner and feed results into callbacks
      const apiKey = process.env.API_KEY;

      let scriptPath = module.parent.filename;
      scriptPath = scriptPath.replace(".spec", "");
      const src = fs.readFileSync(scriptPath, "utf8");
      const payload = {
        event: data,
        script: src,
      };
      const res = request("POST", "https://api.akenza.io/v3/run-script", {
        json: payload,
        headers: { "x-api-key": apiKey },
      });
      const results = JSON.parse(res.getBody("utf8"));
      results.forEach((result) => {
        expectations[nExpectation](result.type.toLowerCase(), result.event);
        nExpectation += 1;
      });
    } else {
      consume(data);
    }

    assert.equal(
      nExpectation,
      expectations.length,
      "number of expected emits not reached",
    );
  };
};
