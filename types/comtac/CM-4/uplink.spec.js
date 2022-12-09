const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Comtac LPN CM-4 Uplink", () => {
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

  let historySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/history.schema.json`)
      .then((parsedSchema) => {
        historySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN CM-4 payload default", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "011204C603090B40",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 23.15);
        assert.equal(value.data.humidity, 64);
        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batLow, false);
        assert.equal(value.data.lastTempValid, true);
        assert.equal(value.data.extMEM, false);
        assert.equal(value.data.acc, false);
        assert.equal(value.data.tempI2C, true);
        assert.equal(value.data.tempPt100, false);
        assert.equal(value.data.infoReq, false);
        assert.equal(value.data.configRX, false);
        assert.equal(value.data.button, false);
        assert.equal(value.data.alarming, true);
        assert.equal(value.data.history, false);
        assert.equal(value.data.async, false);
        assert.equal(value.data.batteryLevel, 99);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
  describe("consume()", () => {
    it("should decode the Comtac LPN CM-4 payload history", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "011202C604090B40090B40090B40090B40090B40090B40090B40090B40",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "history");
        assert.equal(value.data.temperature, 23.15);
        assert.equal(value.data.humidity, 64);
        assert.equal(value.data.tempHistory1, 23.15);
        assert.equal(value.data.humHistory1, 64);
        assert.equal(value.data.tempHistory2, 23.15);
        assert.equal(value.data.humHistory2, 64);
        assert.equal(value.data.tempHistory3, 23.15);
        assert.equal(value.data.humHistory3, 64);
        assert.equal(value.data.tempHistory4, 23.15);
        assert.equal(value.data.humHistory4, 64);
        assert.equal(value.data.tempHistory5, 23.15);
        assert.equal(value.data.humHistory5, 64);
        assert.equal(value.data.tempHistory6, 23.15);
        assert.equal(value.data.humHistory6, 64);
        assert.equal(value.data.tempHistory7, 23.15);
        assert.equal(value.data.humHistory7, 64);
        utils.validateSchema(value.data, historySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batLow, false);
        assert.equal(value.data.lastTempValid, true);
        assert.equal(value.data.extMEM, false);
        assert.equal(value.data.acc, false);
        assert.equal(value.data.tempI2C, true);
        assert.equal(value.data.tempPt100, false);
        assert.equal(value.data.infoReq, false);
        assert.equal(value.data.configRX, false);
        assert.equal(value.data.button, false);
        assert.equal(value.data.alarming, false);
        assert.equal(value.data.history, true);
        assert.equal(value.data.async, false);
        assert.equal(value.data.batteryLevel, 99);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
