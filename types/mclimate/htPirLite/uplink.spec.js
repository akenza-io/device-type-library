import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate HT + PIR Lite uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let rawPayloadSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
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
    it("should decode a MClimate HT + PIR Lite keepalive", () => {
      const data = uplink("8106797DE20F");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 23.3,
          humidity: 48.83,
          occupied: true,
          motion: 15,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 3.55,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "8106797DE20F",
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

    it("should decode MClimate HT + PIR Lite command responses followed by a keepalive", () => {
      const data = uplink("39003C120A8102797DE201");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 23.3,
          humidity: 48.83,
          occupied: false,
          motion: 1,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 3.55,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          occupancyTimeout: 60,
          keepAliveTime: 10,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "39003C120A8102797DE201",
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

    it("should decode a MClimate HT + PIR Lite command response without keepalive", () => {
      const data = uplink("3F80");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          pirSensorSensitivity: 128,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "3F80",
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
      const data = uplink("8102");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 8102");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "8102",
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
