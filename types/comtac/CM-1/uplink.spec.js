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
    }
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
    }
  );
});

describe("Comtac LPN CM-1 Uplink", function () {
  describe("consume()", function () {
    it("should decode the Comtac LPN CM-1 payload", function (done) {
      const data = {
        data: {
          port: 3,
          payload_hex: "00f1f10000000f0afd08520bae",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.booster, false);
          assert.equal(value.data.minHumOn, false);
          assert.equal(value.data.maxHumOn, false);
          assert.equal(value.data.txOnEvent, false);
          assert.equal(value.data.minTempOn, false);
          assert.equal(value.data.maxTempOn, false);

          assert.equal(value.data.minTempThreshold, -15);
          assert.equal(value.data.maxTempThreshold, -15);
          assert.equal(value.data.minHumThreshold, 0);
          assert.equal(value.data.maxHumThreshold, 0);
          assert.equal(value.data.sendInterval, 15);
          assert.equal(value.data.voltage, "2.81");

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 21.3);
          assert.equal(value.data.humidity, 30);

          validate(value.data, defaultSchema, { throwError: true });
        }

        done();
      });

      consume(data);
    });
  });
});
