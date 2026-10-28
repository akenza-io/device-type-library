import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Miromico insight Mioty Uplink", () => {
  let co2Schema = null;
  let consume = null;
  let lifecycleSchema = null;
  let settingsSchema = null;
  let temperatureSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    co2Schema = loadSchema(`${import.meta.dirname}/co2.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    settingsSchema = loadSchema(`${import.meta.dirname}/settings.schema.json`);
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
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

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.consumption, 16);
        assert.equal(data.batteryVoltage, 3.6);
      });

      expectSample("settings", settingsSchema, (data) => {
        assert.equal(data.measurementInterval, 1200);
        assert.equal(data.temperatureSamples, 4);
        assert.equal(data.co2Subsample, 32);
        assert.equal(data.abcCalibrationPeriod, 384);
        assert.equal(data.firmwareHash, "0389A2B9");
      });

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 25);
        assert.equal(data.humidity, 60);
        assert.equal(data.temperature2, 25.52);
        assert.equal(data.humidity2, 59.5);
      });

      expectSample("co2", co2Schema, (data) => {
        assert.equal(data.co2, 779);
      });

      consume(data);
    });
  });
});
