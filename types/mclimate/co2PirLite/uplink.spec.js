import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate CO2 + PIR Lite uplink", () => {
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
    it("should decode a MClimate CO2 + PIR Lite keepalive", () => {
      const data = uplink("8106797EDA4718F1");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 23.3,
          humidity: 49.22,
          co2: 839,
          occupied: true,
          motion: 241,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.48,
        });
      });

      consume(data);
    });

    it("should decode MClimate CO2 + PIR Lite command responses followed by a keepalive", () => {
      const data = uplink("39003C120A8102797BD95A1800");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 23.3,
          humidity: 48.05,
          co2: 858,
          occupied: false,
          motion: 0,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.47,
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

    it("should decode a MClimate CO2 + PIR Lite command response without keepalive", () => {
      const data = uplink("1f02bc03e8");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          boundaryLevelGoodMedium: 700,
          boundaryLevelMediumBad: 1000,
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
