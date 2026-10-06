import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate CO2 Display Lite uplink", () => {
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
    it("should decode a MClimate CO2 Display Lite keepalive", () => {
      const data = uplink("010288800A456B18027A");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 24.8,
          humidity: 50,
          co2: 875,
          light: 634,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 2.63,
          powerSource: "PHOTOVOLTAIC",
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "010288800A456B18027A",
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

    it("should decode MClimate CO2 Display Lite command responses followed by a keepalive", () => {
      const data = uplink("120F0412102F0101026e320c1eb908012c");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 22.2,
          humidity: 19.53,
          co2: 441,
          light: 300,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 3.1,
          powerSource: "PHOTOVOLTAIC",
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          keepAliveTime: 15,
          deviceVersions: {
            hardware: 12,
            software: 10,
          },
          uplinkSendingOnButtonPress: 1,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "120F0412102F0101026e320c1eb908012c",
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

    it("should decode a MClimate CO2 Display Lite command response without keepalive", () => {
      const data = uplink("4300");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          humidityVisibility: 0,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "4300",
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
      const data = uplink("010288");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 010288");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "010288",
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
