import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Comtac LPN CM-2 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let buttonPressedSchema = null;
  let systemSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    buttonPressedSchema = loadSchema(`${import.meta.dirname}/button_pressed.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN CM-2 payload default", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "0110000a5efed419ec07d001f4044809ca154578216a",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.version, 1);
        assert.equal(data.booster, false);
        assert.equal(data.txOnTimer, false);
        assert.equal(data.txOnEvent, false);
        assert.equal(data.buttonEvent, true);
        assert.equal(data.digitalInputEvent, false);
        assert.equal(data.deepSleepEvent, false);
        assert.equal(data.digitalInputState, false);
        assert.equal(data.minTempOn, false);
        assert.equal(data.maxTempOn, false);
        assert.equal(data.minHumOn, false);
        assert.equal(data.maxHumOn, false);
        assert.equal(data.minPt100On, false);
        assert.equal(data.maxPt100On, false);
        assert.equal(data.minLemOn, false);
        assert.equal(data.maxLemOn, false);
        assert.equal(data.batteryVoltage, 2.654);
        assert.equal(data.batteryLevel, 60);
      });

      expectSample("button_pressed", buttonPressedSchema, (data) => {
        assert.equal(data.buttonPressed, true);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, -3);
        assert.equal(data.humidity, 66.36);
        assert.equal(data.temperaturePT100, 20);
        assert.equal(data.adc1, 500);
        assert.equal(data.adc2, 1096);
        assert.equal(data.lem, 2.506);
        assert.equal(data.brightness, 21);
      });

      consume(data);
    });

    it("should decode the Comtac LPN CM-2 system payload", () => {
      const data = {
        data: {
          port: 101,
          payloadHex: "000af1f10000f1f10000000001",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.sendInterval, 10);
        assert.equal(data.minTempThreshold, -15);
        assert.equal(data.maxTempThreshold, -15);
        assert.equal(data.minHumThreshold, 0);
        assert.equal(data.maxHumThreshold, 0);
        assert.equal(data.minPtThreshold, -15);
        assert.equal(data.maxPtThreshold, -15);
        assert.equal(data.minLemThreshold, 0);
        assert.equal(data.maxLemThreshold, 0);
        assert.equal(data.dinSettings, 1);
      });

      consume(data);
    });
  });
});
