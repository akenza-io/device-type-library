import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Abeeway badge tracker uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let gpsFixSchema = null;
  let heartbeatSchema = null;
  let angleDetectionSchema = null;
  let wifiBssidSchema = null;
  let activityStatusSchema = null;
  let bleGeozoningSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    gpsFixSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    heartbeatSchema = loadSchema(`${import.meta.dirname}/operation_status.schema.json`);
    angleDetectionSchema = loadSchema(`${import.meta.dirname}/angle_detection.schema.json`);
    wifiBssidSchema = loadSchema(`${import.meta.dirname}/wifi.schema.json`);
    activityStatusSchema = loadSchema(`${import.meta.dirname}/activity_status.schema.json`);
    bleGeozoningSchema = loadSchema(`${import.meta.dirname}/ble.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Abeeway badge tracker GPS payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03025c8200061c572f054ffb08",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.demandMessage, false);
        assert.equal(data.positionMessage, true);
        assert.equal(data.hasMoved, false);
        assert.equal(data.sos, false);
        assert.equal(data.operatingMode, "STANDBY");
        assert.equal(data.batteryLevel, 92);
        assert.equal(data.temperature, 21.8);
      });

      expectSample("gps", gpsFixSchema, (data) => {
        assert.equal(data.longitude, 8.912768);
        assert.equal(data.latitude, 47.5475712);
        assert.equal(data.horizontalAccuracy, 31);
        assert.equal(data.age, 48);
      });

      consume(data);
      done();
    });

    it("should decode Abeeway badge tracker heartbeat payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "05005c820040020200000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.demandMessage, false);
        assert.equal(data.positionMessage, false);
        assert.equal(data.hasMoved, false);
        assert.equal(data.sos, false);
        assert.equal(data.operatingMode, "STANDBY");

        assert.equal(data.batteryLevel, 92);
        assert.equal(data.temperature, 21.8);
      });

      expectSample("operation_status", heartbeatSchema, (data) => {
        assert.equal(data.resetCause, "SYSTEM_REQUEST");
        assert.equal(data.firmwareVersion, "2.2.0");
        assert.equal(data.bleFirmwareVersion, "0.0.0");
      });

      consume(data);
      done();
    });

    it("should decode Abeeway badge tracker angle alarm", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0a045c82000940000003e800000000fffe0048fc285a",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.demandMessage, false);
        assert.equal(data.positionMessage, false);
        assert.equal(data.hasMoved, true);
        assert.equal(data.sos, false);
        assert.equal(data.operatingMode, "STANDBY");

        assert.equal(data.batteryLevel, 92);
        assert.equal(data.temperature, 21.8);
      });

      expectSample("angle_detection", angleDetectionSchema, (data) => {
        assert.equal(data.transitionState, "NORMAL_TO_CRITICAL");
        assert.equal(data.trigger, "CRITICAL_ANGLE_REPORTING");

        assert.equal(data.repetitionCounter, 0);
        assert.equal(data.age, 0);

        assert.equal(data.refVectorX, 1000);
        assert.equal(data.refVectorY, 0);
        assert.equal(data.refVectorZ, 0);

        assert.equal(data.critVectorX, -2);
        assert.equal(data.critVectorY, 72);
        assert.equal(data.critVectorZ, -984);

        assert.equal(data.angle, 90);
      });

      consume(data);
      done();
    });

    it("should decode Abeeway badge tracker BSSID", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "032c36844926c8675e842cd7c76cc217d827bebc34dbfdad0e31b4c8675e8200d4b2",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.demandMessage, false);
        assert.equal(data.positionMessage, false);
        assert.equal(data.hasMoved, true);
        assert.equal(data.sos, false);
        assert.equal(data.operatingMode, "MOTION_TRACKING");

        assert.equal(data.batteryLevel, 54);
        assert.equal(data.temperature, 22.8);
      });

      expectSample("wifi", wifiBssidSchema, (data) => {
        assert.equal(data.age, 304);

        assert.equal(data.bssid0, "c8:67:5e:84:2c:d7");
        assert.equal(data.rssi0, -57);
        assert.equal(data.bssid1, "6c:c2:17:d8:27:be");
        assert.equal(data.rssi1, -68);
        assert.equal(data.bssid2, "34:db:fd:ad:0e:31");
        assert.equal(data.rssi2, -76);
        assert.equal(data.bssid3, "c8:67:5e:82:00:d4");
        assert.equal(data.rssi3, -78);
      });

      consume(data);
      done();
    });

    it("should decode Abeeway badge tracker activity status", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0700458600010000000a",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.demandMessage, false);
        assert.equal(data.positionMessage, false);
        assert.equal(data.hasMoved, false);
        assert.equal(data.sos, false);
        assert.equal(data.operatingMode, "STANDBY");

        assert.equal(data.batteryLevel, 69);
        assert.equal(data.temperature, 23.8);
      });

      expectSample("activity_status", activityStatusSchema, (data) => {
        assert.equal(data.activityCounter, 10);
      });

      consume(data);
      done();
    });

    it("should decode Abeeway badge tracker geofencing", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0a04538a000a01b5dffb",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.demandMessage, false);
        assert.equal(data.positionMessage, false);
        assert.equal(data.hasMoved, true);
        assert.equal(data.sos, false);
        assert.equal(data.operatingMode, "STANDBY");

        assert.equal(data.batteryLevel, 83);
        assert.equal(data.temperature, 25.8);
      });

      expectSample("ble", bleGeozoningSchema, (data) => {
        assert.equal(data.shortID, 0);
        assert.equal(data.notification, "ENTRY");
        assert.equal(data.beaconID, 11919355);
      });

      consume(data);
      done();
    });

    it("should decode Abeeway badge tracker configuration", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0784327d800201000002581500000064",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.demandMessage, false);
        assert.equal(data.positionMessage, false);
        assert.equal(data.hasMoved, true);
        assert.equal(data.sos, false);
        assert.equal(data.operatingMode, "ACTIVITY_TRACKING");

        assert.equal(data.batteryLevel, 50);
        assert.equal(data.temperature, 19.2);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");

        assert.equal(value.data.loraPeriod, 600);
        assert.equal(value.data.shockDetection, 100);
        // No configuration schema
      });

      consume(data);
      done();
    });
  });
});
