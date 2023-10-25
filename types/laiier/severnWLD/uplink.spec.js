const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Laiier severnWLD Uplink", () => {
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

  let startUpSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/start_up.schema.json`)
      .then((parsedSchema) => {
        startUpSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Laiier severnWLD measurement payload", () => {
      const data = {
        data: {
          port: 104,
          payloadHex: "340A7102dc008A0C",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.batteryVoltage, 3.21);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, startUpSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "measurement");

        assert.equal(value.data.distance, 261.2);
        assert.equal(value.data.fillLevel, 56);
        assert.equal(value.data.measurementType, "REGULAR_MEASUREMENT");
        assert.equal(value.data.temperature, 22);

        utils.validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Adnexo ax-dist invalid measurement payload", () => {
      const data = {
        data: {
          port: 104,
          payloadHex: "340A7102dc008A0C",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "invalid_measurement");
        assert.equal(value.data.measurementVariance, 62.5);

        utils.validateSchema(value.data, invalidMeasurementSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
