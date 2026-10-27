import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Seeed SenseCAP T1000A Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let eventSchema = null;
  let settingsSchema = null;
  let gpsSchema = null;
  let errorSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    eventSchema = loadSchema(`${import.meta.dirname}/event.schema.json`);
    settingsSchema = loadSchema(`${import.meta.dirname}/settings.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    errorSchema = loadSchema(`${import.meta.dirname}/error.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP T1000A Sensor gps payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "090000800064b909080082355b02d379e460",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 96);
        assert.equal(data.collectTime, 1689848072000);
        assert.equal(data.motionId, 0);
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.endMovementEvent, false);
        assert.equal(data.lightEvent, false);
        assert.equal(data.motionlessEvent, false);
        assert.equal(data.pressOnceEvent, true);
        assert.equal(data.shockEvent, false);
        assert.equal(data.sosEvent, false);
        assert.equal(data.startMovementEvent, false);
        assert.equal(data.temperatureEvent, false);
      });

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.latitude, 47.413732);
        assert.equal(data.longitude, 8.533339);
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP T1000A Sensor startup payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0260010a0105010002d0003c003c0001",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 96);
        assert.equal(data.eventInterval, 60);
        assert.equal(data.firmwareVersion, "1.10");
        assert.equal(data.hardwareVersion, "1.5");
        assert.equal(data.heartbeatInterval, 720);
        assert.equal(data.periodicInterval, 60);
        assert.equal(data.sosMode, 1);
        assert.equal(data.workMode, 1);
        assert.equal(data.sensorEnabled, 0);
        assert.equal(data.positioningStrategy, 0);
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP T1000A Sensor empty payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0d00000000",
        },
      };

      expectSample("error", errorSchema, (data) => {
        assert.equal(data.error, "");
        assert.equal(data.errorCode, 0);
      });

      consume(data);
    });

    it("should decode Seeed SenseCAP T1000A Sensor sos payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "06000040006502cf150082390e02d37bd400f200641f",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 31);
        assert.equal(data.collectTime, 1694682901000);
        assert.equal(data.motionId, 0);
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.endMovementEvent, false);
        assert.equal(data.lightEvent, false);
        assert.equal(data.motionlessEvent, false);
        assert.equal(data.pressOnceEvent, false);
        assert.equal(data.shockEvent, false);
        assert.equal(data.sosEvent, true);
        assert.equal(data.startMovementEvent, false);
        assert.equal(data.temperatureEvent, false);
      });

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.latitude, 47.414228);
        assert.equal(data.longitude, 8.534286);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 100);
        assert.equal(data.temperature, 24.2);
      });

      consume(data);
    });
  });
});
