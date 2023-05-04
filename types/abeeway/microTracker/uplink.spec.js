const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Abeeway micro tracker uplink", () => {
  let gpsFixSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsFixSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let heartbeatSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/operation_status.schema.json`)
      .then((parsedSchema) => {
        heartbeatSchema = parsedSchema;
        done();
      });
  });

  let angleDetectionSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/angle_detection.schema.json`)
      .then((parsedSchema) => {
        angleDetectionSchema = parsedSchema;
        done();
      });
  });

  let wifiBssidSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/wifi.schema.json`).then((parsedSchema) => {
      wifiBssidSchema = parsedSchema;
      done();
    });
  });

  let activityStatusSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/activity_status.schema.json`)
      .then((parsedSchema) => {
        activityStatusSchema = parsedSchema;
        done();
      });
  });

  let bleGeozoningSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/ble.schema.json`).then((parsedSchema) => {
      bleGeozoningSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Abeeway micro tracker GPS payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03025c8200061c572f054ffb08",
        },
      };

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.longitude, 8.912768);
        assert.equal(value.data.latitude, 47.5475712);
        assert.equal(value.data.horizontalAccuracy, 31);
        assert.equal(value.data.age, 48);
        utils.validateSchema(value.data, gpsFixSchema, { throwError: true });
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

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "operation_status");
        assert.equal(value.data.resetCause, "SYSTEM_REQUEST");
        assert.equal(value.data.firmwareVersion, "2.2.0");
        assert.equal(value.data.bleFirmwareVersion, "0.0.0");

        utils.validateSchema(value.data, heartbeatSchema, { throwError: true });
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

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "angle_detection");
        assert.equal(value.data.transitionState, "NORMAL_TO_CRITICAL");
        assert.equal(value.data.trigger, "CRITICAL_ANGLE_REPORTING");

        assert.equal(value.data.repetitionCounter, 0);
        assert.equal(value.data.age, 0);

        assert.equal(value.data.refVectorX, 1000);
        assert.equal(value.data.refVectorY, 0);
        assert.equal(value.data.refVectorZ, 0);

        assert.equal(value.data.critVectorX, -2);
        assert.equal(value.data.critVectorY, 72);
        assert.equal(value.data.critVectorZ, -984);

        assert.equal(value.data.angle, 90);

        utils.validateSchema(value.data, angleDetectionSchema, {
          throwError: true,
        });
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

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "wifi");

        assert.equal(value.data.age, 304);

        assert.equal(value.data.bssid0, "c8:67:5e:84:2c:d7");
        assert.equal(value.data.rssi0, -57);
        assert.equal(value.data.bssid1, "6c:c2:17:d8:27:be");
        assert.equal(value.data.rssi1, -68);
        assert.equal(value.data.bssid2, "34:db:fd:ad:0e:31");
        assert.equal(value.data.rssi2, -76);
        assert.equal(value.data.bssid3, "c8:67:5e:82:00:d4");
        assert.equal(value.data.rssi3, -78);

        utils.validateSchema(value.data, wifiBssidSchema, { throwError: true });
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

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "activity_status");
        assert.equal(value.data.activityCounter, 10);

        utils.validateSchema(value.data, activityStatusSchema, {
          throwError: true,
        });
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

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ble");

        assert.equal(value.data.shortID, 0);
        assert.equal(value.data.notification, "ENTRY");
        assert.equal(value.data.beaconID, 11919355);

        utils.validateSchema(value.data, bleGeozoningSchema, {
          throwError: true,
        });
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

      utils.expectEmits((type, value) => {
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

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
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
