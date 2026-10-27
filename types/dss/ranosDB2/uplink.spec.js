import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("DSS Ranos dB 2 Uplink", () => {
  let defaultSchema = null;
  let gpsSchema = null;
  let lifecycleSchema = null;
  let settingsSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    settingsSchema = loadSchema(`${import.meta.dirname}/settings.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the DSS Ranos dB 2 payload", () => {
      const data = {
        data: {
          payloadHex: "7bff3c5ed3421c3e57160592ae0580408c140041406812104120",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.dBAfast, 32.2);
        assert.equal(data.dBAslow, 30.4);
        assert.equal(data.dBCfast, 33.5);
        assert.equal(data.dBCslow, 32);
        assert.equal(data.leqA, 30.1);
        assert.equal(data.leqC, 32);
        assert.equal(data.positivePeakHoldA, 32.6);
        assert.equal(data.positivePeakHoldC, 36.5);
        assert.equal(data.negativePeakHoldA, 31.8);
        assert.equal(data.negativePeakHoldC, 31.8);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 6);
        assert.equal(data.batteryLevel, 70);
      });

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.latitude, 47.4141534);
        assert.equal(data.longitude, 8.5350206);
      });

      consume(data);
    });

    it("should decode the DSS Ranos dB 2 settings payload", () => {
      const data = {
        data: {
          payloadHex: "800009F701002E93020260EA0000BFFF80",
        },
      };

      expectSample("settings", settingsSchema, (data) => {
        assert.equal(data.adr, false);
        assert.equal(data.correction, -0.9);
        assert.equal(data.enableHeadphone, false);
        assert.equal(data.enableLed, true);
        assert.equal(data.enableTransmissionSync, true);
        assert.equal(data.gpsInterval, 43200000);
        assert.equal(data.gpsMode, "ONCE");
        assert.equal(data.sampleCount, 2);
        assert.equal(data.spreadingFactor, 9);
        assert.equal(data.transmitInterval, 60000);
        assert.equal(data.useBat, true);
        assert.equal(data.useFirstTimestamp, true);
        assert.equal(data.useLAeq, true);
        assert.equal(data.useLAf, true);
        assert.equal(data.useLAmax, true);
        assert.equal(data.useLAmin, true);
        assert.equal(data.useLAs, true);
        assert.equal(data.useLastTimestamp, true);
        assert.equal(data.useLCeq, true);
        assert.equal(data.useLCf, true);
        assert.equal(data.useLCmax, true);
        assert.equal(data.useLCmin, true);
        assert.equal(data.useLCs, true);
        assert.equal(data.useMsgInfo, true);
      });
      consume(data);
    });
  });
});
