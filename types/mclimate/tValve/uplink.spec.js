import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate T-Valve uplink", () => {
  let defaultSchema = null;
  let statusSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    configurationSchema = loadSchema(`${import.meta.dirname}/configuration.schema.json`);
  });

  function uplink(payloadHex) {
    return {
      data: {
        payloadHex,
      },
      device: {
        deviceId: "70B3D52DD3000010",
      },
      uplinkMetrics: {
        timestamp: "1670849361.1912086",
        port: 2,
        frameCountUp: 6,
        rssi: -90,
        snr: 7,
        sf: 7,
      },
    };
  }

  describe("consume()", () => {
    it("should decode a MClimate T-Valve short keepalive", () => {
      const data = uplink("2cc0");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          waterTemperature: 22,
          ambientTemperature: 22,
          valveOpen: true,
        });
      });

      consume(data);
    });

    it("should decode a MClimate T-Valve long packet", () => {
      const data = uplink("646304089f");

      expectSample("status", statusSchema, (data) => {
        assert.deepEqual(data, {
          messageType: "CONTROL_BUTTON_PRESSED",
          boxTamper: false,
          floodWireBroken: true,
          flood: false,
          magnet: false,
          alarmValidated: false,
          manualOpenEnabled: true,
          manualCloseEnabled: true,
          closeTime: 4,
          openTime: 8,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 2.872,
          batteryTooLow: false,
          softwareVersion: 3,
        });
      });

      consume(data);
    });

    it("should decode a MClimate T-Valve flood alarm with a low battery", () => {
      const data = uplink("5a63040890");

      expectSample("status", statusSchema, (data) => {
        assert.deepEqual(data, {
          messageType: "FLOOD_DETECTED",
          boxTamper: true,
          floodWireBroken: false,
          flood: true,
          magnet: false,
          alarmValidated: false,
          manualOpenEnabled: true,
          manualCloseEnabled: true,
          closeTime: 4,
          openTime: 8,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 2.752,
          batteryTooLow: true,
          softwareVersion: 3,
        });
      });

      consume(data);
    });

    it("should decode MClimate T-Valve command responses after the long packet", () => {
      const data = uplink("646304089f0f05100c16c6");

      expectSample("status", statusSchema, (data) => {
        assert.deepEqual(data, {
          messageType: "CONTROL_BUTTON_PRESSED",
          boxTamper: false,
          floodWireBroken: true,
          flood: false,
          magnet: false,
          alarmValidated: false,
          manualOpenEnabled: true,
          manualCloseEnabled: true,
          closeTime: 4,
          openTime: 8,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 2.872,
          batteryTooLow: false,
          softwareVersion: 3,
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          emergencyOpenings: 5,
          floodAlarmTime: 12,
          joinRetryPeriod: 16.5,
        });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("646304");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 646304");
      });

      consume(data);
    });
  });
});
