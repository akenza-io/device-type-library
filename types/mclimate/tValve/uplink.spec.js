import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate T-Valve uplink", () => {
  let defaultSchema = null;
  let statusSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let rawPayloadSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
    statusSchema = await loadSchema(`${__dirname}/status.schema.json`);
    lifecycleSchema = await loadSchema(`${__dirname}/lifecycle.schema.json`);
    configurationSchema = await loadSchema(
      `${__dirname}/configuration.schema.json`,
    );
    rawPayloadSchema = await loadSchema(`${__dirname}/raw_payload.schema.json`);
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          waterTemperature: 22,
          ambientTemperature: 22,
          valveOpen: true,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "2cc0",
          timestamp: "1670849361.1912086",
          port: 2,
          frameCountUp: 6,
          rssi: -90,
          snr: 7,
          spreadingFactor: 7,
        });

        validateSchema(value.data, rawPayloadSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a MClimate T-Valve long packet", () => {
      const data = uplink("646304089f");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "status");
        assert.deepEqual(value.data, {
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

        validateSchema(value.data, statusSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 2.872,
          batteryTooLow: false,
          softwareVersion: 3,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "646304089f",
          timestamp: "1670849361.1912086",
          port: 2,
          frameCountUp: 6,
          rssi: -90,
          snr: 7,
          spreadingFactor: 7,
        });

        validateSchema(value.data, rawPayloadSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a MClimate T-Valve flood alarm with a low battery", () => {
      const data = uplink("5a63040890");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "status");
        assert.deepEqual(value.data, {
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

        validateSchema(value.data, statusSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 2.752,
          batteryTooLow: true,
          softwareVersion: 3,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "5a63040890",
          timestamp: "1670849361.1912086",
          port: 2,
          frameCountUp: 6,
          rssi: -90,
          snr: 7,
          spreadingFactor: 7,
        });

        validateSchema(value.data, rawPayloadSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode MClimate T-Valve command responses after the long packet", () => {
      const data = uplink("646304089f0f05100c16c6");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "status");
        assert.deepEqual(value.data, {
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

        validateSchema(value.data, statusSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 2.872,
          batteryTooLow: false,
          softwareVersion: 3,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          emergencyOpenings: 5,
          floodAlarmTime: 12,
          joinRetryPeriod: 16.5,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "646304089f0f05100c16c6",
          timestamp: "1670849361.1912086",
          port: 2,
          frameCountUp: 6,
          rssi: -90,
          snr: 7,
          spreadingFactor: 7,
        });

        validateSchema(value.data, rawPayloadSchema, { throwError: true });
      });

      consume(data);
    });

    it("should still forward the raw payload if it cannot be decoded", () => {
      const data = uplink("646304");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 646304");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "646304",
          timestamp: "1670849361.1912086",
          port: 2,
          frameCountUp: 6,
          rssi: -90,
          snr: 7,
          spreadingFactor: 7,
        });

        validateSchema(value.data, rawPayloadSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
