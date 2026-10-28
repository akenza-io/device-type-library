import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("ioTracker 3 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let gpsSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
  });

  describe("consume()", () => {
    it("should decode ioTracker 3 keepalive payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "1700fa0b0a82443440004000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.uplinkReason, "BUTTON");
        assert.equal(data.crc, 0);
        assert.equal(data.batteryLevel, 98);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 26.9);
        assert.equal(data.light, 172.16);
        assert.equal(data.maxAccelerationNew, 16.384);
        assert.equal(data.maxAccelerationHistory, 16.384);
      });

      consume(data);
      done();
    });

    it("should decode ioTracker 3 gps payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "1803fa0b0b0877ee00004000031c42d1d205162903143e1210001300091a07",
        },
      };

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.altitude, 518.2);
        assert.equal(data.cog, 0.9);
        assert.equal(data.hAcc, 18);
        assert.equal(data.hdop, 2.6);
        assert.equal(data.latitude, 47.4141138);
        assert.equal(data.longitude, 8.5338371);
        assert.equal(data.navStat, 3);
        assert.equal(data.numSvs, 7);
        assert.equal(data.sog, 1.9);
        assert.equal(data.vAcc, 16);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.uplinkReason, "STATUS");
        assert.equal(data.crc, 3);
        assert.equal(data.batteryLevel, 98);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 2598.4);
        assert.equal(data.maxAccelerationHistory, 16.384);
        assert.equal(data.maxAccelerationNew, 0);
        assert.equal(data.temperature, 28.24);
      });

      consume(data);
      done();
    });
  });
});
