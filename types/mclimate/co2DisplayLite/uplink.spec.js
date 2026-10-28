import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate CO2 Display Lite uplink", () => {
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
    it("should decode a MClimate CO2 Display Lite keepalive", () => {
      const data = uplink("010288800A456B18027A");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 24.8,
          humidity: 50,
          co2: 875,
          light: 634,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 2.63,
          powerSource: "PHOTOVOLTAIC",
        });
      });

      consume(data);
    });

    it("should decode MClimate CO2 Display Lite command responses followed by a keepalive", () => {
      const data = uplink("120F0412102F0101026e320c1eb908012c");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 22.2,
          humidity: 19.53,
          co2: 441,
          light: 300,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.1,
          powerSource: "PHOTOVOLTAIC",
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          keepAliveTime: 15,
          hardwareVersion: 12,
          softwareVersion: 10,
          uplinkSendingOnButtonPress: 1,
        });
      });

      consume(data);
    });

    it("should decode a MClimate CO2 Display Lite command response without keepalive", () => {
      const data = uplink("4300");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          humidityVisibility: 0,
        });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("010288");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 010288");
      });

      consume(data);
    });
  });
});
