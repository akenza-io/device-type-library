const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("DSS Ranos dB 2 Uplink", () => {
  let defaultSchema = null;
  let gpsSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
      });
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
    });
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the DSS Ranos dB 2 payload", () => {
      const data = {
        data: {
          payloadHex: "7ffe21c8f3f5030000035d761acdd0461c3cd9c5051adf311424",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.voltage, 7);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 47.3749957);
        assert.equal(value.data.longitude, 8.5647153);

        validate(value.data, gpsSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soundAvg, 52.925);
        assert.equal(value.data.dBAfast, 43.5);
        assert.equal(value.data.dBAslow, 44.3);
        assert.equal(value.data.dBCfast, 55.3);
        assert.equal(value.data.dBCslow, 55.9);
        assert.equal(value.data.leqA, 30);
        assert.equal(value.data.leqC, 30);
        assert.equal(value.data.positivePeakHoldA, 51.5);
        assert.equal(value.data.positivePeakHoldC, 67.4);
        assert.equal(value.data.negativePeakHoldA, 40.7);
        assert.equal(value.data.negativePeakHoldC, 52.1);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
