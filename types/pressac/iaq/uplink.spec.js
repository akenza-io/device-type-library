import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Pressac IAQ Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let occupancySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    configurationSchema = loadSchema(`${import.meta.dirname}/configuration.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Pressac IAQ default payload", () => {
      const data = {
        data: {
          payloadHex: "262100000f825a0100802010042900d5",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 22.5);
        assert.equal(data.co2, 1065);
        assert.equal(data.humidity, 45);
        assert.equal(data.pm1, 1);
        assert.equal(data.pm2_5, 1);
        assert.equal(data.pm4, 2);
        assert.equal(data.pm10, 2);
        assert.equal(data.tvoc, 213);
        assert.equal(data.vocUnit, "TVOC μg/m3");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.co2Active, true);
        assert.equal(data.dataAge, 0);
        assert.equal(data.luxActive, false);
        assert.equal(data.pirActive, false);
        assert.equal(data.pmActive, true);
        assert.equal(data.revision, 1);
        assert.equal(data.soundLevelActive, false);
        assert.equal(data.tempHumActive, true);
        assert.equal(data.tvocActive, true);
      });

      consume(data);
    });

    it("should decode Pressac IAQ boot payload", () => {
      const data = {
        data: {
          payloadHex: "261100054102000f1e1d01d68226140a00",
        },
      };

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.co2FreshAirBackgroundLevel, 470);
        assert.equal(data.co2HasManualCalibrationPerformed, false);
        assert.equal(data.co2IndoorAirBackgroundLevel, 550);
        assert.equal(data.co2IsAutoCalibrationEnabled, true);
        assert.equal(data.firmwareVersion, '0.5.4.1');
        assert.equal(data.hardwareRegionSelection, "EU868");
        assert.equal(data.humidityOffset, 10);
        assert.equal(data.humidityOffsetScaled, 0);
        assert.equal(data.pmAutoCleanInterval, 7);
        assert.equal(data.pmIsAutoCleanIntervalSet, true);
        assert.equal(data.readConfiguration, "DIP_SWITCH");
        assert.equal(data.readInterval, 15);
        assert.equal(data.resetReason, "HARD_RESET");
        assert.equal(data.temperatureOffset, 20);
        assert.equal(data.temperatureOffsetScaled, 0);
        assert.equal(data.vocEquivalent, "Isobutylene");
        assert.equal(data.vocUnit, "TVOC μg/m3");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.co2Active, true);
        assert.equal(data.luxActive, false);
        assert.equal(data.pirActive, false);
        assert.equal(data.pmActive, true);
        assert.equal(data.revision, 1);
        assert.equal(data.soundLevelActive, false);
        assert.equal(data.tempHumActive, true);
        assert.equal(data.tvocActive, true);
      });

      consume(data);
    });
  });
});
