import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Brigther Bins uplink", () => {
  let distanceSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let fillLevelSchema = null;
  let systemSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    distanceSchema = loadSchema(`${import.meta.dirname}/distance.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    fillLevelSchema = loadSchema(`${import.meta.dirname}/fill_level.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Brigther Bins Type Filllevel payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "308e30",
        },
      };

      expectSample("fill_level", fillLevelSchema, (data) => {
        assert.equal(data.fillLevel, 12);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 96);
        assert.equal(data.temperature, 31);
        assert.equal(data.resetReason, "CLEARED");
      });

      consume(data);
    });

    it("should decode Brigther Bins Type Distance payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "308e31",
        },
      };

      expectSample("distance", distanceSchema, (data) => {
        assert.equal(data.distance, 396);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.temperature, -23);
        assert.equal(data.batteryLevel, 24);
      });

      consume(data);
    });

    it("should decode Brigther Bins Type System payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FFD2380163D06808013C63C2",
        },
      };

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.communicationTest, true);
        assert.equal(data.distanceTest, true);
        assert.equal(data.temperatureTest, true);

        assert.equal(data.hardwareVersion, 22);
        assert.equal(data.softwareVersion, "1.15.1");
        assert.equal(data.totalResetCount, 1);
        assert.equal(data.runtime, 2);
        assert.equal(data.downlinkFreq, 2);
        assert.equal(data.noOfDownlinks, 2);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 98);
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.resetReason, "CLEARED");
      });

      consume(data);
    });
  });
});
