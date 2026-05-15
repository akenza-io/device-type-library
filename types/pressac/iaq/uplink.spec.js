

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Pressac IAQ Uplink", () => {
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

  let configurationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/configuration.schema.json`)
      .then((parsedSchema) => {
        configurationSchema = parsedSchema;
        done();
      });
  });

  let occupancySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Pressac IAQ default payload", () => {
      const data = {
        data: {
          payloadHex: "262100000f825a0100802010042900d5",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 22.5);
        assert.equal(value.data.co2, 1065);
        assert.equal(value.data.humidity, 45);
        assert.equal(value.data.pm1, 1);
        assert.equal(value.data.pm2_5, 1);
        assert.equal(value.data.pm4, 2);
        assert.equal(value.data.pm10, 2);
        assert.equal(value.data.tvoc, 213);
        assert.equal(value.data.vocUnit, "TVOC μg/m3");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.co2Active, true);
        assert.equal(value.data.dataAge, 0);
        assert.equal(value.data.luxActive, false);
        assert.equal(value.data.pirActive, false);
        assert.equal(value.data.pmActive, true);
        assert.equal(value.data.revision, 1);
        assert.equal(value.data.soundLevelActive, false);
        assert.equal(value.data.tempHumActive, true);
        assert.equal(value.data.tvocActive, true);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Pressac IAQ boot payload", () => {
      const data = {
        data: {
          payloadHex: "261100054102000f1e1d01d68226140a00=",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.co2FreshAirBackgroundLevel, 470);
        assert.equal(value.data.co2HasManualCalibrationPerformed, false);
        assert.equal(value.data.co2IndoorAirBackgroundLevel, 550);
        assert.equal(value.data.co2IsAutoCalibrationEnabled, true);
        assert.equal(value.data.firmwareVersion, '0.5.4.1');
        assert.equal(value.data.hardwareRegionSelection, "EU868");
        assert.equal(value.data.humidityOffset, 10);
        assert.equal(value.data.humidityOffsetScaled, 0);
        assert.equal(value.data.pmAutoCleanInterval, 7);
        assert.equal(value.data.pmIsAutoCleanIntervalSet, true);
        assert.equal(value.data.readConfiguration, "DIP_SWITCH");
        assert.equal(value.data.readInterval, 15);
        assert.equal(value.data.resetReason, "HARD_RESET");
        assert.equal(value.data.temperatureOffset, 20);
        assert.equal(value.data.temperatureOffsetScaled, 0);
        assert.equal(value.data.vocEquivalent, "Isobutylene");
        assert.equal(value.data.vocUnit, "TVOC μg/m3");

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.co2Active, true);
        assert.equal(value.data.luxActive, false);
        assert.equal(value.data.pirActive, false);
        assert.equal(value.data.pmActive, true);
        assert.equal(value.data.revision, 1);
        assert.equal(value.data.soundLevelActive, false);
        assert.equal(value.data.tempHumActive, true);
        assert.equal(value.data.tvocActive, true);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
