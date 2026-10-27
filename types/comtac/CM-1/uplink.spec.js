import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Comtac LPN CM-1 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let buttonPressedSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    buttonPressedSchema = loadSchema(`${import.meta.dirname}/button_pressed.schema.json`);
  });
  describe("consume()", () => {
    it("should decode the Comtac LPN CM-1 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "10f1f10000000f0ab60a091379",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.booster, false);
        assert.equal(data.minHumOn, false);
        assert.equal(data.maxHumOn, false);
        assert.equal(data.txOnEvent, true);
        assert.equal(data.minTempOn, false);
        assert.equal(data.maxTempOn, false);
        assert.equal(data.minTempThreshold, -15);
        assert.equal(data.maxTempThreshold, -15);
        assert.equal(data.minHumThreshold, 0);
        assert.equal(data.maxHumThreshold, 0);
        assert.equal(data.sendInterval, 15);
        assert.equal(data.batteryVoltage, 2.74);
        assert.equal(data.batteryLevel, 70);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 25.7);
        assert.equal(data.humidity, 50);
      });

      expectSample("button_pressed", buttonPressedSchema, (data) => {
        assert.equal(data.buttonPressed, true);
      });
      consume(data);
    });
  });
});
