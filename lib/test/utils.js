const fs = require("fs");
const chai = require("chai");
const assert = chai.assert;

exports.loadSchema = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", function (err, fileContents) {
      if (err) reject(err);
      let schema = JSON.parse(fileContents);
      resolve(schema);
    });
  });
};

var expectations = [];
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
    emit: function (type, value) {
      if (expectations.length < nExpectation) {
        throw "not enough expecatations provided";
      }

      expectations[nExpectation](type, value);
      nExpectation++;
    },
  });
  return (data) => {
    if (expectations.length <= 0) {
      throw "at least one expectation must be set";
    }

    consume(data);
    assert.equal(
      nExpectation,
      expectations.length,
      "number of expected emits not reached"
    );
  };
};
