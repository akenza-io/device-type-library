const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let lifecycleSchema = null;
let buttonEventSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/lifecycle.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      buttonEventSchema = JSON.parse(fileContents);
      done();
    }
  );
});

before(function (done) {
  fs.readFile(
    __dirname + "/button_event.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Swisscom Multisense Button Uplink", function () {
  describe("consume()", function () {
    it("should decode the Swisscom Multisense Button payload", function () {
      const data = {
        data: {
          port: 3,
          payload_hex: "020040b5",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.payloadVersion, 2);
          assert.equal(value.data.mode, 0);
          assert.equal(value.data.voltage, 3086);
          assert.equal(value.data.batteryLevel, 71);
          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "button_event") {
          assert.equal(value.data.buttonPressed, true);
          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
