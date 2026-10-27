import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Wika Pew 1000 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let deviceAlarmSchema = null;
  let deviceInformationSchema = null;
  let errorSchema = null;
  let lifecycleSchema = null;
  let processAlarmSchema = null;
  let technicalAlarmSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    deviceAlarmSchema = loadSchema(`${import.meta.dirname}/device_alarm.schema.json`);
    deviceInformationSchema = loadSchema(`${import.meta.dirname}/device_information.schema.json`);
    errorSchema = loadSchema(`${import.meta.dirname}/error.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    processAlarmSchema = loadSchema(`${import.meta.dirname}/process_alarm.schema.json`);
    technicalAlarmSchema = loadSchema(`${import.meta.dirname}/technical_alarm.schema.json`);
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

      expectSample("error", errorSchema, (data) => {
        assert.equal(data.errorMessage, "Please define the customfields: pressureRangeStart, pressureRangeEnd, temperatureRangeStart, temperatureRangeEnd");
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

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.5);
        assert.equal(data.deviceTemperature, 3.96);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pressure, -0.011);
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

      expectSample("process_alarm", processAlarmSchema, (data) => {
        assert.equal(data.alarmChannel, "PRESSURE");
        assert.equal(data.alarmStatus, "TRIGGERED");
        assert.equal(data.alarmType, "HIGH_THRESHOLD");
        assert.equal(data.value, 4.08);
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

      expectSample("technical_alarm", technicalAlarmSchema, (data) => {
        assert.equal(data.alarmStatus, "TRIGGERED");
        assert.deepEqual(data.alarmType, ["SENSOR_COMMUNICATION_ERROR"]);
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

      expectSample("device_alarm", deviceAlarmSchema, (data) => {
        assert.equal(data.alarmStatus, "TRIGGERED");
        assert.deepEqual(data.alarmType, "LOW_BATTERY");
        assert.deepEqual(data.causeOfFailure, "GENERIC");
        assert.deepEqual(data.value, 2.8);
      });

      consume(data);
    });
  });
});
