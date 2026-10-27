import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("pepperlFuchs wilsenSonicLevel uplink", () => {
  let consume = null;
  let defaultSchema = null;
  let locationSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    locationSchema = loadSchema(`${import.meta.dirname}/location.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  // This is the test for default, copy this three times with different data hex to test it all
  describe("consume()", () => {
    it("should decode the default payload 1", () => {
      const data = {
        data: {
          payloadHex: "040B010041030B06590602014100000003510123",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.proximity, 65);
        assert.equal(data.fillinglvlPercent, 89);
        assert.equal(data.temperature, 8);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.5);
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the location payload 2", () => {
      const data = {
        data: {
          payloadHex:
            "040B010041030B06590602014101999A03510122065002007D217806500102F1C3DF",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.proximity, 65);
        assert.equal(data.fillinglvlPercent, 89);
        assert.equal(data.temperature, 8);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.4);
      });

      expectSample("location", locationSchema, (data) => {
        assert.equal(data.latitude, 49.398751);
        assert.equal(data.longitude, 8.200568);
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the lifecycle payload 3", () => {
      const data = {
        data: {
          payloadHex:
            "102A2534383030303030303632383738330431010701043102032206310300000F1C03510123",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.serialNumber, 1.0591369900271589e33);
        assert.equal(data.loraCount, 1793);
        assert.equal(data.gpsCount, 802);
        assert.equal(data.usSensorCount, 3868);
        assert.equal(data.batteryVoltage, 3.5);
      });

      consume(data);
    });
  });
});
