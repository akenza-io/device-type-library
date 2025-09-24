
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Transmitter 600-053", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
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

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    loadSchema(`${__dirname}/alarm.schema.json`)
      .then((parsedSchema) => {
        alarmSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the 600-053 periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0000ea253611FF700000003203E800000000000000000000000000000000",
        },
      };

      // --- Lifecycle ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 234);
        assert.equal(value.data.type, 37);
        assert.equal(value.data.seqCounter, 54);
        assert.equal(value.data.fwVersion, 17);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 00

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.closeTo(value.data.temperature, -14.4, 0.1);
        assert.equal(value.data.humidity, 5);
        assert.equal(value.data.co2, 1000);
        assert.equal(value.data.msgType, "NORMAL");
        assert.equal(value.data.co2Sampled, false);
        assert.equal(value.data.ledOn, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.temperatureLow, false);
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.humidityLow, false);
        assert.equal(value.data.co2High, false);
        assert.equal(value.data.co2Low, false);
        assert.equal(value.data.motionGuard, false);

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
