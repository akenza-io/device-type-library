

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digital matter Oyster 3 Uplink", () => {
  let positionSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/position.schema.json`)
      .then((parsedSchema) => {
        positionSchema = parsedSchema;
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

  let downlinkAckSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/downlink_ack.schema.json`)
      .then((parsedSchema) => {
        downlinkAckSchema = parsedSchema;
        done();
      });
  });

  let statsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/stats.schema.json`).then((parsedSchema) => {
      statsSchema = parsedSchema;
      done();
    });
  });

  let watchdogSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/watchdog.schema.json`)
      .then((parsedSchema) => {
        watchdogSchema = parsedSchema;
        done();
      });
  });

  let statsV3Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/stats_v3.schema.json`)
      .then((parsedSchema) => {
        statsV3Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the digital matter Oyster 3 gps payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0030edec003224450000de",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 5.55);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "position");
        assert.equal(value.data.latitude, -32);
        assert.equal(value.data.longitude, 116);
        assert.equal(value.data.inTrip, false);
        assert.equal(value.data.fixFailed, false);
        assert.equal(value.data.headingDeg, 0);
        assert.equal(value.data.speedKmph, 0);

        validateSchema(value.data, positionSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "downlink_ack");
        assert.equal(value.data.accepted, true);
        assert.equal(value.data.firmware, "1.2");
        assert.equal(value.data.hwRev, 1);
        assert.equal(value.data.port, 10);
        assert.equal(value.data.productId, 98);
        assert.equal(value.data.sequence, 83);

        validateSchema(value.data, downlinkAckSchema, {
          throwError: true,
        });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "stats");
        assert.equal(value.data.aveGnssFailS, 133);
        assert.equal(value.data.aveGnssFixS, 96);
        assert.equal(value.data.aveGnssFreshenS, 120);
        assert.equal(value.data.gnssFails, 7232);
        assert.equal(value.data.gnssSuccesses, 10464);
        assert.equal(value.data.initialvoltage, 5.1);
        assert.equal(value.data.tripCount, 194336);
        assert.equal(value.data.txCount, 59136);
        assert.equal(value.data.uptimeWeeks, 189);
        assert.equal(value.data.wakeupsPerTrip, 56);

        validateSchema(value.data, statsSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.55);
        assert.equal(value.data.batteryLevel, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "watchdog");
        assert.equal(value.data.resetExternal, false);
        assert.equal(value.data.resetPowerOn, false);
        assert.equal(value.data.resetSoftware, false);
        assert.equal(value.data.resetWatchdog, true);
        assert.equal(value.data.watchdogReason, 259);

        validateSchema(value.data, watchdogSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "stats");
        assert.equal(value.data.initialvoltage, 10.54);
        assert.equal(value.data.tripCount, 115872);
        assert.equal(value.data.uptimeWeeks, 664);
        assert.equal(value.data.wakeupsPerTrip, 243);

        validateSchema(value.data, statsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "stats_v3");
        assert.equal(value.data.batCritical, false);
        assert.equal(value.data.batLow, false);
        assert.equal(value.data.currentvoltage, 7.436);
        assert.equal(value.data.mWhUsed, 5280);
        assert.equal(value.data.percentGnssFail, 37.5);
        assert.equal(value.data.percentGnssSucc, 12.5);
        assert.equal(value.data.percentLora, 21.875);
        assert.equal(value.data.percentOther, 3.125);
        assert.equal(value.data.percentSleepDis, 25);
        assert.equal(value.data.ttff, 139);

        validateSchema(value.data, statsV3Schema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 5.932);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "position");
        assert.equal(value.data.latitude, -8.3333874);
        assert.equal(value.data.longitude, -169.2850041);
        assert.equal(value.data.fixFailed, false);
        assert.equal(value.data.headingDeg, 225);
        assert.equal(value.data.inactiveDuration, "16d2h18m");
        assert.equal(value.data.inactivityAlarm, false);
        assert.equal(value.data.inTrip, true);
        assert.equal(value.data.speedKmph, 90);

        validateSchema(value.data, positionSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
