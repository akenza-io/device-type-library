

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Miromico insight Uplink", () => {
  let co2Schema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/co2.schema.json`).then((parsedSchema) => {
      co2Schema = parsedSchema;
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

  let settingsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/settings.schema.json`)
      .then((parsedSchema) => {
        settingsSchema = parsedSchema;
        done();
      });
  });

  let temperatureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Miromico insight payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0701C40978F809770505B00404C40706100020008001050310000000020ABE050B0389A2B903020b03",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.consumption, 16);
        assert.equal(value.data.batteryVoltage, 3.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "settings");
        assert.equal(value.data.measurementInterval, 1200);
        assert.equal(value.data.temperatureSamples, 4);
        assert.equal(value.data.co2Subsample, 32);
        assert.equal(value.data.abcCalibrationPeriod, 384);
        assert.equal(value.data.firmwareHash, "0389A2B9");

        validateSchema(value.data, settingsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 25);
        assert.equal(value.data.humidity, 60);
        assert.equal(value.data.temperature2, 25.52);
        assert.equal(value.data.humidity2, 59.5);

        validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 779);

        validateSchema(value.data, co2Schema, { throwError: true });
      });

      consume(data);
    });
  });
});
