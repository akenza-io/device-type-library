const fs = require("fs");
const chai = require("chai");

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
  script.__set__({
    Bits: bits,
    emit(type, value) {
      if (nExpectation >= expectations.length) {
        throw new Error("not enough expecatations provided");
      }

      expectations[nExpectation](type, value);
      nExpectation++;
    },
  });
  return (data) => {
    if (expectations.length <= 0) {
      throw new Error("at least one expectation must be set");
    }

    consume(data);
    assert.equal(
      nExpectation,
      expectations.length,
      "number of expected emits not reached",
    );
  };
};
