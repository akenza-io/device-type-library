import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";

describe("Abeeway micro tracker uplink", () => {
  let gpsFixSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let heartbeatSchema = null;
  let angleDetectionSchema = null;
  let wifiBssidSchema = null;
  let activityStatusSchema = null;
  let bleGeozoningSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    gpsFixSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    heartbeatSchema = loadSchema(`${import.meta.dirname}/operation_status.schema.json`);
    angleDetectionSchema = loadSchema(`${import.meta.dirname}/angle_detection.schema.json`);
    wifiBssidSchema = loadSchema(`${import.meta.dirname}/wifi.schema.json`);
    activityStatusSchema = loadSchema(`${import.meta.dirname}/activity_status.schema.json`);
    bleGeozoningSchema = loadSchema(`${import.meta.dirname}/ble.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Abeeway micro tracker GPS payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03025c8200061c572f054ffb08",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, true);
        assert.equal(value.data.hasMoved, false);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "STANDBY");

        assert.equal(value.data.batteryLevel, 92);
        assert.equal(value.data.temperature, 21.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectSample("gps", gpsFixSchema, (data) => {
        assert.equal(data.longitude, 8.912768);
        assert.equal(data.latitude, 47.5475712);
        assert.equal(data.horizontalAccuracy, 31);
        assert.equal(data.age, 48);
      });

      consume(data);
    });

    it("should decode Abeeway micro tracker heartbeat payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "05005c820040020200000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, false);
        assert.equal(value.data.hasMoved, false);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "STANDBY");

        assert.equal(value.data.batteryLevel, 92);
        assert.equal(value.data.temperature, 21.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectSample("operation_status", heartbeatSchema, (data) => {
        assert.equal(data.resetCause, "SYSTEM_REQUEST");
        assert.equal(data.firmwareVersion, "2.2.0");
        assert.equal(data.bleFirmwareVersion, "0.0.0");
      });

      consume(data);
    });

    it("should decode Abeeway micro tracker angle alarm", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0a045c82000940000003e800000000fffe0048fc285a",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, false);
        assert.equal(value.data.hasMoved, true);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "STANDBY");

        assert.equal(value.data.batteryLevel, 92);
        assert.equal(value.data.temperature, 21.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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
    });

    it("should decode Abeeway micro tracker BSSID", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "032c36844926c8675e842cd7c76cc217d827bebc34dbfdad0e31b4c8675e8200d4b2",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, false);
        assert.equal(value.data.hasMoved, true);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "MOTION_TRACKING");

        assert.equal(value.data.batteryLevel, 54);
        assert.equal(value.data.temperature, 22.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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
    });

    it("should decode Abeeway micro tracker activity status", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0700458600010000000a",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, false);
        assert.equal(value.data.hasMoved, false);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "STANDBY");

        assert.equal(value.data.batteryLevel, 69);
        assert.equal(value.data.temperature, 23.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectSample("activity_status", activityStatusSchema, (data) => {
        assert.equal(data.activityCounter, 10);
      });

      consume(data);
    });

    it("should decode Abeeway micro tracker geofencing", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0a04538a000a01b5dffb",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, false);
        assert.equal(value.data.hasMoved, true);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "STANDBY");

        assert.equal(value.data.batteryLevel, 83);
        assert.equal(value.data.temperature, 25.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectSample("ble", bleGeozoningSchema, (data) => {
        assert.equal(data.shortID, 0);
        assert.equal(data.notification, "ENTRY");
        assert.equal(data.beaconID, 11919355);
      });

      consume(data);
    });

    it("should decode Abeeway micro tracker configuration", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0784327d800201000002581500000064",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.demandMessage, false);
        assert.equal(value.data.positionMessage, false);
        assert.equal(value.data.hasMoved, true);
        assert.equal(value.data.sos, false);
        assert.equal(value.data.operatingMode, "ACTIVITY_TRACKING");

        assert.equal(value.data.batteryLevel, 50);
        assert.equal(value.data.temperature, 19.2);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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
    });
  });
});
