import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Digital matter Oyster 3 Uplink", () => {
  let positionSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let downlinkAckSchema = null;
  let statsSchema = null;
  let watchdogSchema = null;
  let statsV3Schema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    positionSchema = loadSchema(`${import.meta.dirname}/position.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    downlinkAckSchema = loadSchema(`${import.meta.dirname}/downlink_ack.schema.json`);
    statsSchema = loadSchema(`${import.meta.dirname}/stats.schema.json`);
    watchdogSchema = loadSchema(`${import.meta.dirname}/watchdog.schema.json`);
    statsV3Schema = loadSchema(`${import.meta.dirname}/stats_v3.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the digital matter Oyster 3 gps payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0030edec003224450000de",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 5.55);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("position", positionSchema, (data) => {
        assert.equal(data.latitude, -32);
        assert.equal(data.longitude, 116);
        assert.equal(data.inTrip, false);
        assert.equal(data.fixFailed, false);
        assert.equal(data.headingDeg, 0);
        assert.equal(data.speedKmph, 0);
      });

      consume(data);
    });

    it("should decode the digital matter Oyster 3 downlink ack", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "D3010262010A",
        },
      };

      expectSample("downlink_ack", downlinkAckSchema, (data) => {
        assert.equal(data.accepted, true);
        assert.equal(data.firmware, "1.2");
        assert.equal(data.hwRev, 1);
        assert.equal(data.port, 10);
        assert.equal(data.productId, 98);
        assert.equal(data.sequence, 83);
      });

      consume(data);
    });

    it("should decode the digital matter Oyster 3, device statistics", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "8BF3DC7B9438984278B85E",
        },
      };

      expectSample("stats", statsSchema, (data) => {
        assert.equal(data.aveGnssFailS, 133);
        assert.equal(data.aveGnssFixS, 96);
        assert.equal(data.aveGnssFreshenS, 120);
        assert.equal(data.gnssFails, 7232);
        assert.equal(data.gnssSuccesses, 10464);
        assert.equal(data.initialvoltage, 5.1);
        assert.equal(data.tripCount, 194336);
        assert.equal(data.txCount, 59136);
        assert.equal(data.uptimeWeeks, 189);
        assert.equal(data.wakeupsPerTrip, 56);
      });

      consume(data);
    });

    it("should decode the digital matter Oyster 4, extended gnss", () => {
      const data = {
        data: {
          port: 4,
          payloadHex: "53AB783C04A1F98E06",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.55);
        assert.equal(data.batteryLevel, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "position");
        assert.equal(value.data.latitude, 202.4493824);
        assert.equal(value.data.longitude, -159.3558016);
        assert.equal(value.data.inTrip, false);
        assert.equal(value.data.fixFailed, true);
        assert.equal(value.data.headingDeg, 45);
        assert.equal(value.data.speedKmph, 155);

        // utils.validateSchema(value.data, positionSchema, { throwError: true }); // Position has illegal values defined by the manufacture docs, still decodes "correctly"
      });

      consume(data);
    });

    it("should decode the digital matter Oyster 4, watchdog", () => {
      const data = {
        data: {
          port: 30,
          payloadHex: "010A62010203017A",
        },
      };

      expectSample("watchdog", watchdogSchema, (data) => {
        assert.equal(data.resetExternal, false);
        assert.equal(data.resetPowerOn, false);
        assert.equal(data.resetSoftware, false);
        assert.equal(data.resetWatchdog, true);
        assert.equal(data.watchdogReason, 259);
      });

      consume(data);
    });

    it("should decode the digital matter Oyster 4, stats_v3", () => {
      const data = {
        data: {
          port: 31,
          payloadHex: "8BF3DC7B94389842780843",
        },
      };

      expectSample("stats", statsSchema, (data) => {
        assert.equal(data.initialvoltage, 10.54);
        assert.equal(data.tripCount, 115872);
        assert.equal(data.uptimeWeeks, 664);
        assert.equal(data.wakeupsPerTrip, 243);
      });

      expectSample("stats_v3", statsV3Schema, (data) => {
        assert.equal(data.batCritical, false);
        assert.equal(data.batLow, false);
        assert.equal(data.currentvoltage, 7.436);
        assert.equal(data.mWhUsed, 5280);
        assert.equal(data.percentGnssFail, 37.5);
        assert.equal(data.percentGnssSucc, 12.5);
        assert.equal(data.percentLora, 21.875);
        assert.equal(data.percentOther, 3.125);
        assert.equal(data.percentSleepDis, 25);
        assert.equal(data.ttff, 139);
      });

      consume(data);
    });

    it("should decode the digital matter Oyster 4, inactivity timer", () => {
      const data = {
        data: {
          port: 33,
          payloadHex: "E825F49B9E872B6A992AAB",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 5.932);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("position", positionSchema, (data) => {
        assert.equal(data.latitude, -8.3333874);
        assert.equal(data.longitude, -169.2850041);
        assert.equal(data.fixFailed, false);
        assert.equal(data.headingDeg, 225);
        assert.equal(data.inactiveDuration, "16d2h18m");
        assert.equal(data.inactivityAlarm, false);
        assert.equal(data.inTrip, true);
        assert.equal(data.speedKmph, 90);
      });

      consume(data);
    });
  });
});
