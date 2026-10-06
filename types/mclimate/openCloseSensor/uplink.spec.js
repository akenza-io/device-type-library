import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate Open/Close Sensor uplink", () => {
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
    it("should decode a MClimate Open/Close Sensor keepalive", () => {
      const data = uplink("01AB00D91B5CAE01");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          messageType: "KEEPALIVE",
          open: true,
          eventCount: 1793198,
          temperature: 21.7,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 2.968,
          thermistorOperational: true,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "01AB00D91B5CAE01",
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

    it("should decode a MClimate Open/Close Sensor open/close event with a negative temperature", () => {
      const data = uplink("20AB08321B5CAF00");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          messageType: "OPEN_CLOSE",
          open: false,
          eventCount: 1793199,
          temperature: -5,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 2.968,
          thermistorOperational: true,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "20AB08321B5CAF00",
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

    it("should decode MClimate Open/Close Sensor command responses followed by an event", () => {
      const data = uplink("04131212F019781B001D02181F0020E200D700000100");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          messageType: "OPEN_CLOSE",
          open: false,
          eventCount: 1,
          temperature: 21.5,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryVoltage: 3.408,
          thermistorOperational: true,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          deviceVersions: {
            hardware: 13,
            software: 12,
          },
          keepAliveTime: 240,
          joinRetryPeriod: 10,
          uplinkType: 0,
          watchDogParams: {
            wdpC: 2,
            wdpUc: 24,
          },
          notificationBlindTime: 0,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "04131212F019781B001D02181F0020E200D700000100",
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

    it("should decode a MClimate Open/Close Sensor command response without keepalive", () => {
      const data = uplink("1F05");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          notificationBlindTime: 5,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "1F05",
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
      const data = uplink("01AB00");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 01AB00");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "raw_payload");
        assert.deepEqual(value.data, {
          deviceId: "70B3D52DD3000010",
          payloadHex: "01AB00",
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
