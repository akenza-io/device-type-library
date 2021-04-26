const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let timedSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/button_event.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      timedSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Swisscom Multisense Uplink", function () {
  describe("consume()", function () {
    it("should decode the Swisscom Multisense payload", function (done) {
      const data = {
        data: {
          port: 3,
          payload_hex: "010080a3010945026e0300170412820503f8007cfffc",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "timed_event") {
          assert.equal(value.data.payloadVersion, 1);
          assert.equal(value.data.mode, 0);
          assert.equal(value.data.voltage, 2978);
          assert.equal(value.data.batteryLevel, 64);
          assert.equal(value.data.temperature, 23.73);
          assert.equal(value.data.humidity, 55);
          assert.equal(value.data.reedCounter, 23);
          assert.equal(value.data.motionCounter, 4738);
          assert.equal(value.data.accX, 1016);
          assert.equal(value.data.accY, 124);
          assert.equal(value.data.accZ, -4);

          validate(value.data, timedSchema, { throwError: true });
        }

        done();
      });

      consume(data);
    });
  });
});
