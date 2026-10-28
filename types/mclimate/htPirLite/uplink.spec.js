import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate HT + PIR Lite uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
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
    it("should decode a MClimate HT + PIR Lite keepalive", () => {
      const data = uplink("8106797DE20F");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 23.3,
          humidity: 48.83,
          occupied: true,
          motion: 15,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.55,
        });
      });

      consume(data);
    });

    it("should decode MClimate HT + PIR Lite command responses followed by a keepalive", () => {
      const data = uplink("39003C120A8102797DE201");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 23.3,
          humidity: 48.83,
          occupied: false,
          motion: 1,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.55,
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          occupancyTimeout: 60,
          keepAliveTime: 10,
        });
      });

      consume(data);
    });

    it("should decode a MClimate HT + PIR Lite command response without keepalive", () => {
      const data = uplink("3F80");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          pirSensorSensitivity: 128,
        });
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
