

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Wika Netris1 Uplink", () => {
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

  let deviceAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/device_alarm.schema.json`)
      .then((parsedSchema) => {
        deviceAlarmSchema = parsedSchema;
        done();
      });
  });

  let deviceInformationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/device_information.schema.json`)
      .then((parsedSchema) => {
        deviceInformationSchema = parsedSchema;
        done();
      });
  });

  let errorSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`)
      .then((parsedSchema) => {
        errorSchema = parsedSchema;
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

  let processAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/process_alarm.schema.json`)
      .then((parsedSchema) => {
        processAlarmSchema = parsedSchema;
        done();
      });
  });

  let technicalAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/technical_alarm.schema.json`)
      .then((parsedSchema) => {
        technicalAlarmSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Wika Netris1 uplink without set customfields", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0100000CB3",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.errorMessage, "Please define the customfields: rangeStart, rangeEnd, channelMeasurand");

        validateSchema(value.data, errorSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Netris1 standard uplink", () => {
      const data = {
        device: {
          customFields: {
            rangeStart: 0,
            rangeEnd: 10,
            channelMeasurand: "voltage"
          }
        },
        data: {
          port: 1,
          payloadHex:
            "0100000CB3",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.voltage, 0.751);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Netris 1 process alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            rangeStart: 0,
            rangeEnd: 10,
            channelMeasurand: "voltage"
          }
        },
        data: {
          port: 1,
          payloadHex:
            "031100000D73",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.alarmChannel, "voltage");
        assert.equal(value.data.alarmStatus, "TRIGGERED");
        assert.equal(value.data.alarmType, "LOW_THRESHOLD");
        assert.equal(value.data.value, 0.943);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Netris 1 technical alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            rangeStart: 0,
            rangeEnd: 10,
            channelMeasurand: "voltage"
          }
        },
        data: {
          port: 1,
          payloadHex:
            "0401000081",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.alarmStatus, 129);
        assert.deepEqual(value.data.alarmType, ["SSM_COMMUNICATION_ERROR", "SSM_IDENTITY_ERROR"]);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Netris 1 device alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            rangeStart: 0,
            rangeEnd: 10,
            channelMeasurand: "voltage"
          }
        },
        data: {
          port: 1,
          payloadHex:
            "05000001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.alarmType, 1);
        assert.deepEqual(value.data.alarmTypeNames, ["LOW_BATTERY_ERROR"]);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
