
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Transmitter 600-023", () => {
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
    it("should decode the 600-023 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "00007706111200E3011F0014013200000000",
        },
      };

      // --- Lifecycle
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.id, 119);
        assert.equal(value.data.type, 6);
        assert.equal(value.data.seqCounter, 17);
        assert.equal(value.data.fwVersion, 18);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default (environmental values)
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");

        assert.closeTo(value.data.temperature, 22.7, 0.1);
        assert.closeTo(value.data.humidity, 28.7, 0.1);
        assert.equal(value.data.voc, 20);
        assert.equal(value.data.co2, 306);
        assert.equal(value.data.msgType, "NORMAL");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.vocLow, false);
        assert.equal(value.data.vocHigh, false);
        assert.equal(value.data.humidityLow, false);
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.temperatureLow, false);
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.co2Low, false);
        assert.equal(value.data.co2High, false);

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
