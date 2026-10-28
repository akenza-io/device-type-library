import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Comtac LPN CM-3 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN CM-3 payload default", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "001104c8010211",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 5.29);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batLow, false);
        assert.equal(data.lastTempValid, true);
        assert.equal(data.extMEM, false);
        assert.equal(data.acc, false);
        assert.equal(data.tempI2C, false);
        assert.equal(data.tempPt100, true);
        assert.equal(data.infoReq, false);
        assert.equal(data.configRX, false);
        assert.equal(data.button, false);
        assert.equal(data.alarming, true);
        assert.equal(data.history, false);
        assert.equal(data.async, false);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
