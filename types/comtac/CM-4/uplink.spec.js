import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Comtac LPN CM-4 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let historySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    historySchema = loadSchema(`${import.meta.dirname}/history.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN CM-4 payload default", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "011204C603090B40",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 23.15);
        assert.equal(data.humidity, 64);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batLow, false);
        assert.equal(data.lastTempValid, true);
        assert.equal(data.extMEM, false);
        assert.equal(data.acc, false);
        assert.equal(data.tempI2C, true);
        assert.equal(data.tempPt100, false);
        assert.equal(data.infoReq, false);
        assert.equal(data.configRX, false);
        assert.equal(data.button, false);
        assert.equal(data.alarming, true);
        assert.equal(data.history, false);
        assert.equal(data.async, false);
        assert.equal(data.batteryLevel, 99);
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

      expectSample("history", historySchema, (data) => {
        assert.equal(data.temperature, 23.15);
        assert.equal(data.humidity, 64);
        assert.equal(data.tempHistory1, 23.15);
        assert.equal(data.humHistory1, 64);
        assert.equal(data.tempHistory2, 23.15);
        assert.equal(data.humHistory2, 64);
        assert.equal(data.tempHistory3, 23.15);
        assert.equal(data.humHistory3, 64);
        assert.equal(data.tempHistory4, 23.15);
        assert.equal(data.humHistory4, 64);
        assert.equal(data.tempHistory5, 23.15);
        assert.equal(data.humHistory5, 64);
        assert.equal(data.tempHistory6, 23.15);
        assert.equal(data.humHistory6, 64);
        assert.equal(data.tempHistory7, 23.15);
        assert.equal(data.humHistory7, 64);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batLow, false);
        assert.equal(data.lastTempValid, true);
        assert.equal(data.extMEM, false);
        assert.equal(data.acc, false);
        assert.equal(data.tempI2C, true);
        assert.equal(data.tempPt100, false);
        assert.equal(data.infoReq, false);
        assert.equal(data.configRX, false);
        assert.equal(data.button, false);
        assert.equal(data.alarming, false);
        assert.equal(data.history, true);
        assert.equal(data.async, false);
        assert.equal(data.batteryLevel, 99);
      });

      consume(data);
    });
  });
});
