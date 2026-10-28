import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("GWF RCM®-LRW10", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the GWF RCM®-LRW10 payload default", () => {
      const data = {
        state: {},
        data: {
          port: 1,
          payloadHex: "02E61E785634120700C80113F803000000E8",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.meterMedium, "WATER");
        assert.equal(data.actualityDuration, 456);
        assert.equal(data.volume, 1.016);
        assert.equal(data.relativeVolume, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.protocolType, 2);
        assert.equal(data.manufacturerID, 7910);
        assert.equal(data.meterID, 12345678);
        assert.equal(data.appError, "NO_ERROR");
        assert.equal(data.batteryPowerLow, false);
        assert.equal(data.permantError, false);
        assert.equal(data.temporaryError, false);
        assert.equal(data.commandError1, false);
        assert.equal(data.commandError2, false);
        assert.equal(data.commandError3, false);
        assert.equal(data.continuousFlow, false);
        assert.equal(data.brokenPipe, false);
        assert.equal(data.batteryLow, false);
        assert.equal(data.backflow, false);
        assert.equal(data.noUsage, false);
        assert.equal(data.loraLinkError, false);
        assert.equal(data.batteryLifetime, 138);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastVolume, 1.016);
      });

      consume(data);
    });

    it("should decode the GWF RCM®-LRW10 payload default and calculate increment", () => {
      const data = {
        state: { lastVolume: 0.5 },
        data: {
          port: 1,
          payloadHex: "02E61E785634120700C80113F803000000E8",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.meterMedium, "WATER");
        assert.equal(data.actualityDuration, 456);
        assert.equal(data.volume, 1.016);
        assert.equal(data.relativeVolume, 0.516);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.protocolType, 2);
        assert.equal(data.manufacturerID, 7910);
        assert.equal(data.meterID, 12345678);
        assert.equal(data.appError, "NO_ERROR");
        assert.equal(data.batteryPowerLow, false);
        assert.equal(data.permantError, false);
        assert.equal(data.temporaryError, false);
        assert.equal(data.commandError1, false);
        assert.equal(data.commandError2, false);
        assert.equal(data.commandError3, false);
        assert.equal(data.continuousFlow, false);
        assert.equal(data.brokenPipe, false);
        assert.equal(data.batteryLow, false);
        assert.equal(data.backflow, false);
        assert.equal(data.noUsage, false);
        assert.equal(data.loraLinkError, false);
        assert.equal(data.batteryLifetime, 138);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastVolume, 1.016);
      });

      consume(data);
    });
  });
});
