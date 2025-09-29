

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Comtac LPN CM-2 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let buttonPressedSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/button_pressed.schema.json`)
      .then((parsedSchema) => {
        buttonPressedSchema = parsedSchema;
        done();
      });
  });

  let systemSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN CM-2 payload default", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "0110000a5efed419ec07d001f4044809ca154578216a",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.version, 1);
        assert.equal(value.data.booster, false);
        assert.equal(value.data.txOnTimer, false);
        assert.equal(value.data.txOnEvent, false);
        assert.equal(value.data.buttonEvent, true);
        assert.equal(value.data.digitalInputEvent, false);
        assert.equal(value.data.deepSleepEvent, false);
        assert.equal(value.data.digitalInputState, false);
        assert.equal(value.data.minTempOn, false);
        assert.equal(value.data.maxTempOn, false);
        assert.equal(value.data.minHumOn, false);
        assert.equal(value.data.maxHumOn, false);
        assert.equal(value.data.minPt100On, false);
        assert.equal(value.data.maxPt100On, false);
        assert.equal(value.data.minLemOn, false);
        assert.equal(value.data.maxLemOn, false);
        assert.equal(value.data.batteryVoltage, 2.654);
        assert.equal(value.data.batteryLevel, 60);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "button_pressed");
        assert.equal(value.data.buttonPressed, true);

        validateSchema(value.data, buttonPressedSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, -3);
        assert.equal(value.data.temperatureF, 26.6);
        assert.equal(value.data.humidity, 66.36);
        assert.equal(value.data.temperaturePT100, 20);
        assert.equal(value.data.temperaturePT100F, 68);
        assert.equal(value.data.adc1, 500);
        assert.equal(value.data.adc2, 1096);
        assert.equal(value.data.lem, 2.506);
        assert.equal(value.data.brightness, 21);
        validateSchema(value.data, defaultSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");

        assert.equal(value.data.sendInterval, 10);
        assert.equal(value.data.minTempThreshold, -15);
        assert.equal(value.data.minTempThresholdF, 5);
        assert.equal(value.data.maxTempThreshold, -15);
        assert.equal(value.data.maxTempThresholdF, 5);
        assert.equal(value.data.minHumThreshold, 0);
        assert.equal(value.data.maxHumThreshold, 0);
        assert.equal(value.data.minPtThreshold, -15);
        assert.equal(value.data.minPtThresholdF, 5);
        assert.equal(value.data.maxPtThreshold, -15);
        assert.equal(value.data.maxPtThresholdF, 5);
        assert.equal(value.data.minLemThreshold, 0);
        assert.equal(value.data.maxLemThreshold, 0);
        assert.equal(value.data.dinSettings, 1);

        validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
