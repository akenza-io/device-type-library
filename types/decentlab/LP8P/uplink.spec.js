const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab LP8P Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Decentlab LP8P payload", () => {
      const data = {
        data: {
          payloadHex:
            "020578000f67bd618d1cedbd1081d981f4895b0bd80bb50000959895390c25",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 24.36);
        assert.equal(value.data.humidity, 41.63);
        assert.equal(value.data.barometricTemperature, 24.05);
        assert.equal(value.data.pressure, 968);
        assert.equal(value.data.co2, 473);
        assert.equal(value.data.co2LPF, 500);
        assert.equal(value.data.co2Temperature, 23.95);
        assert.equal(value.data.capacitorVoltage1, 3.032);
        assert.equal(value.data.capacitorVoltage2, 2.997);
        assert.equal(value.data.pir, 38296);
        assert.equal(value.data.rawPir, 38201);

        validate(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.109);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceID, 1400);
        assert.equal(value.data.co2SensorStatus, 0);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
