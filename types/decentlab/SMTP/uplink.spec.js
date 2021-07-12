const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

const { assert } = chai;

const script = rewire("./uplink.js");
let defaultSchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before((done) => {
  fs.readFile(
    `${__dirname}/default.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      defaultSchema = JSON.parse(fileContents);
      done();
    },
  );
});

before((done) => {
  fs.readFile(
    `${__dirname}/lifecycle.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    },
  );
});

function loadRemoteSchema(uri) {
  return axios.get(uri).then((res) => {
    if (res.status >= 400) {
      throw new Error(`Schema loading error: ${res.statusCode}`);
    }
    return res.data;
  });
}

describe("Decentlab SMTP Uplink", () => {
  describe("consume()", () => {
    it("should decode Decentlab SMTP payload", (done) => {
      const data = {
        data: {
          payloadHex:
            "020b50000309018a8c09438a9809278a920b3c8aa50c9c8a8c11e08aa500000000000000000b3b",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "lifecycle") {
          assert.equal(value.data.voltage, 2.875);
          assert.equal(value.data.protocolVersion, 2);
          assert.equal(value.data.deviceID, 2896);
          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic == "default") {
          assert.equal(value.data.soilMoistureAtDepth0, -0.39);
          assert.equal(value.data.soilTemperatureAtDepth0, 27);
          assert.equal(value.data.soilMoistureAtDepth1, -0.258);
          assert.equal(value.data.soilTemperatureAtDepth1, 27.12);
          assert.equal(value.data.soilMoistureAtDepth2, -0.314);
          assert.equal(value.data.soilTemperatureAtDepth2, 27.06);
          assert.equal(value.data.soilMoistureAtDepth3, 0.752);
          assert.equal(value.data.soilTemperatureAtDepth3, 27.25);
          assert.equal(value.data.soilMoistureAtDepth4, 1.456);
          assert.equal(value.data.soilTemperatureAtDepth4, 27);
          assert.equal(value.data.soilMoistureAtDepth5, 4.152);
          assert.equal(value.data.soilTemperatureAtDepth5, 27.25);
          assert.equal(value.data.soilMoistureAtDepth6, -5);
          assert.equal(value.data.soilTemperatureAtDepth6, -327.68);
          assert.equal(value.data.soilMoistureAtDepth7, -5);
          assert.equal(value.data.soilTemperatureAtDepth7, -327.68);
          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
