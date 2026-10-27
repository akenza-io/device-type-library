import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Wika Netris1 Uplink", () => {
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
    it("should decode the Wika Netris1 uplink without set customfields", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0100000CB3",
        },
      };

      expectSample("error", errorSchema, (data) => {
        assert.equal(data.errorMessage, "Please define the customfields: rangeStart, rangeEnd, channelMeasurand");
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

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.voltage, 0.751);
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

      expectSample("process_alarm", processAlarmSchema, (data) => {
        assert.equal(data.alarmChannel, "voltage");
        assert.equal(data.alarmStatus, "TRIGGERED");
        assert.equal(data.alarmType, "LOW_THRESHOLD");
        assert.equal(data.value, 0.943);
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

      expectSample("technical_alarm", technicalAlarmSchema, (data) => {
        assert.equal(data.alarmStatus, 129);
        assert.deepEqual(data.alarmType, ["SSM_COMMUNICATION_ERROR", "SSM_IDENTITY_ERROR"]);
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

      expectSample("device_alarm", deviceAlarmSchema, (data) => {
        assert.equal(data.alarmType, 1);
        assert.deepEqual(data.alarmTypeNames, ["LOW_BATTERY_ERROR"]);
      });

      consume(data);
    });
  });
});
