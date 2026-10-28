import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("NanoThings uplink", () => {
  let configurationAckSchema = null;
  let consume = null;
  let deviceStatusSchema = null;
  let firstTimestampSchema = null;
  let lifecycleSchema = null;
  let reportFrameSchema = null;
  let temperatureSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    configurationAckSchema = loadSchema(`${import.meta.dirname}/configuration_ack.schema.json`);
    deviceStatusSchema = loadSchema(`${import.meta.dirname}/device_status.schema.json`);
    firstTimestampSchema = loadSchema(`${import.meta.dirname}/first_timestamp.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    reportFrameSchema = loadSchema(`${import.meta.dirname}/report_frame.schema.json`);
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the nanoTag lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "474B0CB2",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.25);
        assert.equal(data.internalTemperature, 25);
      });

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 21);
      });

      consume(data);
    });

    it("should decode the nanoTag configuration acknowledgement payload", () => {
      const data = {
        data: {
          port: 25,
          payloadHex: "01000f003c00",
        },
      };

      expectSample("configuration_ack", configurationAckSchema, (data) => {
        assert.equal(data.ackId, 1);
        assert.equal(data.recordPeriod, 15);
        assert.equal(data.reportPeriod, 60);
        assert.equal(data.unit, "MINUTES");
      });

      consume(data);
    });

    it("should decode the nanoTag report frame payload", () => {
      const data = {
        data: {
          port: 26,
          payloadHex: "00011c721c601c521c47",
        },
      };

      expectSample("report_frame", reportFrameSchema, (data) => {
        assert.equal(data.fid, 1);
        assert.equal(data.temperature1, 22.8);
        assert.equal(data.temperature2, 22.6);
        assert.equal(data.temperature3, 22.5);
        assert.equal(data.temperature4, 22.4);
      });

      consume(data);
    });

    it("should decode the nanoTag report frame payload", () => {
      const data = {
        data: {
          port: 21,
          payloadHex: "0CC0000000A862C4753A",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.264);
      });

      expectSample("device_status", deviceStatusSchema, (data) => {
        assert.equal(data.lastSampleNumber, 168);
      });

      consume(data);
    });
  });
});
