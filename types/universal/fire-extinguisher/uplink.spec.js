const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/default.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      defaultSchema = JSON.parse(fileContents);
      done();
    },
  );
});
before(function (done) {
  fs.readFile(
    __dirname + "/lifecycle.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    },
  );
});

describe("Universal fire extinguisher", function () {
  describe("consume()", function () {
    it("should decode the universal fire extinguisher payload", function () {
      const data = {
        data: {
          port: 1,
          payloadHex: "0012c800004a7b",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.payloadVersion, 0);
          assert.equal(value.data.batteryPercent, 100);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.isTestMessage, false);
          assert.equal(value.data.isRemoved, true);
          assert.equal(value.data.isSecurityUnlocked, false);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });
      consume(data);
    });
  });
});
