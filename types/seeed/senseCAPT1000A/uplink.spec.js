

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Seeed SenseCAP T1000A Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
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

  let eventSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/event.schema.json`).then((parsedSchema) => {
      eventSchema = parsedSchema;
      done();
    });
  });

  let settingsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/settings.schema.json`)
      .then((parsedSchema) => {
        settingsSchema = parsedSchema;
        done();
      });
  });

  let gpsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
      done();
    });
  });

  let errorSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP T1000A Sensor gps payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "090000800064b909080082355b02d379e460",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.collectTime, 1689848072000);
        assert.equal(value.data.motionId, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.endMovementEvent, false);
        assert.equal(value.data.lightEvent, false);
        assert.equal(value.data.motionlessEvent, false);
        assert.equal(value.data.pressOnceEvent, true);
        assert.equal(value.data.shockEvent, false);
        assert.equal(value.data.sosEvent, false);
        assert.equal(value.data.startMovementEvent, false);
        assert.equal(value.data.temperatureEvent, false);

        validateSchema(value.data, eventSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 47.413732);
        assert.equal(value.data.longitude, 8.533339);

        validateSchema(value.data, gpsSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 96);
        assert.equal(value.data.eventInterval, 60);
        assert.equal(value.data.firmwareVersion, "1.10");
        assert.equal(value.data.hardwareVersion, "1.5");
        assert.equal(value.data.heartbeatInterval, 720);
        assert.equal(value.data.periodicInterval, 60);
        assert.equal(value.data.sosMode, 1);
        assert.equal(value.data.workMode, 1);
        assert.equal(value.data.sensorEnabled, 0);
        assert.equal(value.data.positioningStrategy, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.error, "");
        assert.equal(value.data.errorCode, 0);

        validateSchema(value.data, errorSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 31);
        assert.equal(value.data.collectTime, 1694682901000);
        assert.equal(value.data.motionId, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.endMovementEvent, false);
        assert.equal(value.data.lightEvent, false);
        assert.equal(value.data.motionlessEvent, false);
        assert.equal(value.data.pressOnceEvent, false);
        assert.equal(value.data.shockEvent, false);
        assert.equal(value.data.sosEvent, true);
        assert.equal(value.data.startMovementEvent, false);
        assert.equal(value.data.temperatureEvent, false);

        validateSchema(value.data, eventSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.latitude, 47.414228);
        assert.equal(value.data.longitude, 8.534286);

        validateSchema(value.data, gpsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.light, 100);
        assert.equal(value.data.temperature, 24.2);
        assert.equal(value.data.temperatureF, 75.6);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
