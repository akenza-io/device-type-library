import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate Wireless Thermostat uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
    lifecycleSchema = await loadSchema(`${__dirname}/lifecycle.schema.json`);
    configurationSchema = await loadSchema(
      `${__dirname}/configuration.schema.json`,
    );
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
    it("should decode a MClimate Wireless Thermostat keepalive", () => {
      const data = uplink("810288800A45010900027A00");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 24.8,
          humidity: 50,
          targetTemperature: 26.5,
          light: 634,
          motionDetected: false,
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

      consume(data);
    });

    it("should decode a MClimate Wireless Thermostat keepalive from firmware 1.3 or older", () => {
      const data = uplink("0102888009c41501027a01");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 24.8,
          humidity: 50,
          targetTemperature: 21,
          light: 634,
          motionDetected: true,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 2.5,
          powerSource: "BATTERY",
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode MClimate Wireless Thermostat command responses followed by a keepalive", () => {
      const data = uplink("120A04271481027f880db4011d00000000");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 23.9,
          humidity: 53.13,
          targetTemperature: 28.5,
          light: 0,
          motionDetected: false,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 3.51,
          powerSource: "PHOTOVOLTAIC",
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          keepAliveTime: 10,
          hardwareVersion: 27,
          softwareVersion: 14,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a manual target temperature change", () => {
      const data = uplink("5400d7");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          manualTargetTemperatureUpdate: 21.5,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a MClimate Wireless Thermostat command response without keepalive", () => {
      const data = uplink("5601055e0a");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          sensorCompensationTemperature: -0.5,
          temperatureMeasurementPeriod: 10,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("8102");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 8102");
      });

      consume(data);
    });
  });
});
