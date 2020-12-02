var chai = require("chai");
var validate = require("jsonschema").validate;
var rewire = require("rewire");
var fs = require("fs");

var assert = chai.assert;

var script = rewire("./uplink.js");
var timedSchema = null;
var consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(__dirname + "/timed_event.schema.json", "utf8", function (
    err,
    fileContents
  ) {
    if (err) throw err;
    timedSchema = JSON.parse(fileContents);
    done();
  });
});

describe("Swisscom Multisense Uplink", function () {
  describe("consume()", function () {
    it("should decode the Swisscom Multisense payload", function (done) {
      var data = {
        data: {
          port: 3,
          payload_hex: "010080a3010945026e0300170412820503f8007cfffc",
        }
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "timed_event") {
          assert.equal(value.data.payloadVersion, 1);
          assert.equal(value.data.mode, 0);
          assert.equal(value.data.batteryVoltage, 2978);
          assert.equal(value.data.temperature, 23.73);
          assert.equal(value.data.humidity, 55);
          assert.equal(value.data.reedCounter, 23);
          assert.equal(value.data.motionCounter, 4738);
          assert.equal(value.data.accelerometerX, 1016);
          assert.equal(value.data.accelerometerY, 124);
          assert.equal(value.data.accelerometerZ, -4);

          validate(value.data, timedSchema, { throwError: true });
        }

        done();
      });

      consume(data);
    });
  });
});