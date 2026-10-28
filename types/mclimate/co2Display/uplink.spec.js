import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate CO2 Display uplink", () => {
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
    it("should decode a MClimate CO2 Display keepalive", () => {
      const data = uplink("010288800A456B18027A00");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 24.8,
          humidity: 50,
          co2: 875,
          light: 634,
          motionDetected: false,
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

    it("should decode a MClimate CO2 Display keepalive with motion on battery power", () => {
      const data = uplink("0102784f0c04a519004d01");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 23.2,
          humidity: 30.86,
          co2: 933,
          light: 77,
          motionDetected: true,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.08,
          powerSource: "BATTERY",
        });
      });

      consume(data);
    });

    it("should decode MClimate CO2 Display command responses followed by a keepalive", () => {
      const data = uplink("120A0426100102784f0c04a510004d00");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 23.2,
          humidity: 30.86,
          co2: 677,
          light: 77,
          motionDetected: false,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.08,
          powerSource: "PHOTOVOLTAIC",
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          keepAliveTime: 10,
          hardwareVersion: 26,
          softwareVersion: 10,
        });
      });

      consume(data);
    });

    it("should decode a MClimate CO2 Display command response without keepalive", () => {
      const data = uplink("8305");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          co2ChartVisibility: 1,
          co2DigitalValueVisibility: 0,
          co2EmojiVisibility: 1,
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
