const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
let occupiedSchema = null;
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
    __dirname + "/occupancy.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      occupancySchema = JSON.parse(fileContents);
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

describe("Decentlab IAM Uplink", function () {
  describe("consume()", function () {
    it("should decode IAM payload", function () {
      const data = {
        data: {
          payload_hex: "020bbd007f0b926a515d48bc4e0262006981c7000093d4000b0111",
        },
      };
      let sampleCount = 0;

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        expectEmit(function (type, value) {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");

          if (value.topic == "lifecycle") {
            assert.equal(value.data.voltage, 2.96);
            assert.equal(value.data.protocolVersion, 2);
            assert.equal(value.data.deviceID, 3005);
            assert.equal(value.data.co2SensorStatus, 0);
            validate(value.data, lifecycleSchema, { throwError: true });
          }

          if (value.topic == "default") {
            assert.equal(value.data.temperature, 27.68);
            assert.equal(value.data.humidity, 36.44);
            assert.equal(value.data.pressure, 96412);
            assert.equal(value.data.co2, 455);
            assert.equal(value.data.voc, 273);
            assert.equal(value.data.light, 678.77);
            assert.equal(value.data.pir, 11);

            validate(value.data, defaultSchema, { throwError: true });
          }

          if (value.topic === "occupancy") {
            assert.equal(value.data.occupancy, true);
            validate(value.data, occupancySchema, { throwError: true });
            sampleCount++;
          }
        });
      });

      consume(data);
    });
    //TODO add test case for not occupied
  });
});
