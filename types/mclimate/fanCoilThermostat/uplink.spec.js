import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate Fan Coil Thermostat uplink", () => {
  let defaultSchema = null;
  let configurationSchema = null;
  let rawPayloadSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
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
    it("should decode a MClimate Fan Coil Thermostat keepalive", () => {
      const data = uplink("0102888001090102020101");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 24.8,
          humidity: 50,
          targetTemperature: 26.5,
          operationalMode: "HEATING",
          displayedFanSpeed: 2,
          actualFanSpeed: 2,
          valveOpen: true,
          deviceOn: true,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "0102888001090102020101",
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

    it("should decode MClimate Fan Coil Thermostat command responses followed by a keepalive", () => {
      const data = uplink(
        "120A041212771018141D171018141D01026A4C00DC0100070001",
      );

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 21.8,
          humidity: 29.69,
          targetTemperature: 22,
          operationalMode: "HEATING",
          displayedFanSpeed: 0,
          actualFanSpeed: 7,
          valveOpen: false,
          deviceOn: true,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          keepAliveTime: 10,
          deviceVersions: {
            hardware: 12,
            software: 12,
          },
          heatingCoolingTargetTempRangesUnoccupied: {
            heatingTempMin: 16,
            heatingTempMax: 24,
            coolingTempMin: 20,
            coolingTempMax: 29,
          },
          heatingCoolingTargetTempRanges: {
            heatingTempMin: 16,
            heatingTempMax: 24,
            coolingTempMin: 20,
            coolingTempMax: 29,
          },
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "120A041212771018141D171018141D01026A4C00DC0100070001",
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

    it("should decode MClimate Fan Coil Thermostat command responses without keepalive", () => {
      const data = uplink("2F01027F0167015302");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          targetTemperature: 25.8,
          displayColorMode: 1,
          deviceStatus: 1,
          fctOperationalMode: 2,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "2F01027F0167015302",
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

    it("should decode a manual target temperature change", () => {
      const data = uplink("3000e1");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          manualTargetTemperatureUpdate: 22.5,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "3000e1",
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
      const data = uplink("0102");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 0102");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "0102",
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
