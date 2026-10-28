import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Pressac RCS Uplink", () => {
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
    it("should decode Pressac RCS default payload", () => {
      const data = {
        data: {
          payloadHex: "0620130031825a55015e",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 22.5);
        assert.equal(data.humidity, 45);
        assert.equal(data.soundLevel, 42.5);
        assert.equal(data.illumination, 350);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.revision, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.tempHumActive, true);
        assert.equal(data.soundLevelActive, true);
        assert.equal(data.luxActive, true);
        assert.equal(data.pirActive, false);
        assert.equal(data.dataAge, 0);
      });

      consume(data);
    });

    it("should decode Pressac RCS boot payload", () => {
      const data = {
        data: {
          payloadHex: "06101305410200711e140a140a",
        },
      };

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.firmwareVersion, "0.5.4.1");
        assert.equal(data.resetReason, "HARD_RESET");
        assert.equal(data.hardwareRegionSelection, "EU868");
        assert.equal(data.readConfiguration, "DIP_SWITCH");
        assert.equal(data.readInterval, 15);
        assert.equal(data.pirAbsenceTimeout, 20);
        assert.equal(data.pirRepeatedTimeOut, 10);
        assert.equal(data.temperatureOffset, 20);
        assert.equal(data.temperatureOffsetScaled, 0);
        assert.equal(data.humidityOffset, 10);
        assert.equal(data.humidityOffsetScaled, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.revision, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.tempHumActive, true);
        assert.equal(data.luxActive, true);
        assert.equal(data.soundLevelActive, true);
        assert.equal(data.pirActive, true);
      });

      consume(data);
    });

    it("should decode Pressac RCS occupancy payload", () => {
      const data = {
        data: {
          payloadHex: "0630130001",
        },
      };

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupied, true);
        assert.equal(data.occupancy, 1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.revision, 0);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.dataAge, 0);
      });

      consume(data);
    });
  });
});
