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

describe("Comtac LPN CM-2 Uplink", function () {
  describe("consume()", function () {
    it("should decode the Comtac LPN CM-2 payload", function (done) {
      const data = {
        data: {
          port: 3,
          payload_hex: "0110000a5efed419ec07d001f4044809ca154578216a",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.booster, false);
          assert.equal(value.data.txOnTimer, false);
          assert.equal(value.data.txOnEvent, false);
          assert.equal(value.data.buttonEvent, true);
          assert.equal(value.data.digitalInputEvent, false);
          assert.equal(value.data.deepSleepEvent, false);
          assert.equal(value.data.digitalInputState, false);

          assert.equal(value.data.minTempOn, false);
          assert.equal(value.data.maxTempOn, false);
          assert.equal(value.data.minHumOn, false);
          assert.equal(value.data.maxHumOn, false);
          assert.equal(value.data.minPt100On, false);
          assert.equal(value.data.maxPt100On, false);
          assert.equal(value.data.minLemOn, false);
          assert.equal(value.data.maxLemOn, false);

          assert.equal(value.data.voltage, 2.654);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.temperature, -3);
          assert.equal(value.data.humidity, 66.36);
          assert.equal(value.data.temperaturePT100, 20);
          assert.equal(value.data.adc1, 500);
          assert.equal(value.data.adc2, 1096);
          assert.equal(value.data.lem, 2.506);
          assert.equal(value.data.brightness, 21);

          validate(value.data, defaultSchema, { throwError: true });
        }

        done();
      });

      consume(data);
    });
  });
});
