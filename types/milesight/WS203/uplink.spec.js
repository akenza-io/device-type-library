const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("WS203 Uplink", () => {
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
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the WS203 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403673401046865050000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.lastOccupiedValue, false);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.humidity, 50.5);
        assert.equal(value.data.occupied, false);
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.minutesSinceLastOccupied, 0);
        assert.equal(value.data.temperature, 30.8);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryLevel, 100);
        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the WS203 history payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CEAE5BA664040024016520CE5C5CA6640301340165",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.humidity, 50.5);
        assert.equal(value.data.occupied, false);
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.temperature, 29.2);
        assert.equal(value.data.reportType, "PERIOD");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.humidity, 50.5);
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.temperature, 30.8);
        assert.equal(value.data.reportType, "PIR_OCCUPANCY");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
