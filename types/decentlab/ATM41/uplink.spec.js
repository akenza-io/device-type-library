const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

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

function loadRemoteSchema(uri) {
  return axios.get(uri).then(function (res) {
    if (res.status >= 400) {
      throw new Error("Schema loading error: " + res.statusCode);
    }
    return res.data;
  });
}

describe("Decentlab ATM41 Uplink", function () {
  describe("consume()", function () {
    it("should decode Decentlab ATM41 payload", function (done) {
      const data = {
        data: {
          payload_hex: "02035a0003800a8000800080008009812b8014810880b4a57c820c810980027fe88056800880040bf5",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "lifecycle") {

          assert.equal(value.data.protocolVersion, 2);
          assert.equal(value.data.voltage, 3.061);
          assert.equal(value.data.deviceID, 858);

          assert.equal(value.data.sensor_temperature_internal, 26.5);
          assert.equal(value.data.x_orientation_angle, 0.2);
          assert.equal(value.data.y_orientation_angle, -2.4);
          assert.equal(value.data.compass_heading, 86);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic == "default") {
          assert.equal(value.data.precipitation, 0);
          assert.equal(value.data.lightning_strike_count, 0);
          assert.equal(value.data.lightning_average_distance, 0);
          assert.equal(value.data.wind_speed, 0.09);
          assert.equal(value.data.wind_direction, 29.9);
          assert.equal(value.data.maximum_wind_speed, 0.2);
          assert.equal(value.data.temperature, 26.4);
          assert.equal(value.data.vapor_pressure, 1.8);
          assert.equal(value.data.atmospheric_pressure, 95.96);
          assert.equal(value.data.north_wind_speed, 0.08);
          assert.equal(value.data.east_wind_speed, 0.04);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
