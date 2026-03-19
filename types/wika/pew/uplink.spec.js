

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Wika Pew 1000 Uplink", () => {
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
    it("should decode the Wika Pew 1000 uplink without set customfields", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "01002309B91AF0",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.errorMessage, "Please define the customfields: pressureRangeStart, pressureRangeEnd, temperatureRangeStart, temperatureRangeEnd");

        validateSchema(value.data, errorSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 standard uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "01002309B91AF0",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.5);
        assert.equal(value.data.deviceTemperature, 3.96);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, -0.011);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 process alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "03000119B4",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.alarmChannel, "PRESSURE");
        assert.equal(value.data.alarmStatus, "TRIGGERED");
        assert.equal(value.data.alarmType, "HIGH_THRESHOLD");
        assert.equal(value.data.value, 4.08);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 technical alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "040010",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.alarmStatus, "TRIGGERED");
        assert.deepEqual(value.data.alarmType, ["SENSOR_COMMUNICATION_ERROR"]);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 device alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "0500001C",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.alarmStatus, "TRIGGERED");
        assert.deepEqual(value.data.alarmType, "LOW_BATTERY");
        assert.deepEqual(value.data.causeOfFailure, "GENERIC");
        assert.deepEqual(value.data.value, 2.8);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
