const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab IAM Uplink", () => {
  let defaultSchema = null;
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

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let occupancySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode IAM payload", () => {
      const data = {
        data: {
          payloadHex: "020bbd007f0b926a515d48bc4e0262006981c7000093d4000b0111",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 27.68);
        assert.equal(value.data.humidity, 36.44);
        assert.equal(value.data.pressure, 964.12);
        assert.equal(value.data.co2, 455);
        assert.equal(value.data.voc, 273);
        assert.equal(value.data.light, 678.77);
        assert.equal(value.data.pir, 11);

        validate(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.voltage, 2.96);
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceID, 3005);
        assert.equal(value.data.co2SensorStatus, 0);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, true);

        validate(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
