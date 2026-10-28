import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate CO2 uplink", () => {
  let defaultSchema = null;
  let configurationSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    configurationSchema = loadSchema(`${import.meta.dirname}/configuration.schema.json`);
  });

  function uplink(payloadHex) {
    return {
      data: {
        payloadHex,
      },
      device: {
        deviceId: "70B3D52DD3000004",
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
    it("should decode MClimate CO2 payload", () => {
      const data = uplink("0102b9029f6cde");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.co2, 697);
        assert.equal(data.temperature, 27.1);
        assert.equal(data.humidity, 42.19);
        assert.equal(data.batteryVoltage, 3.38);
      });

      consume(data);
    });

    it("should decode MClimate CO2 command responses followed by a keepalive", () => {
      const data = uplink("1f02bc03e82304050625010203120a0102A7027E53E4");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.co2, 679);
        assert.equal(data.temperature, 23.8);
        assert.equal(data.humidity, 32.42);
        assert.equal(data.batteryVoltage, 3.42);
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.boundaryLevelGoodMedium, 700);
        assert.equal(data.boundaryLevelMediumBad, 1000);
        assert.equal(data.notifyPeriodGoodZone, 4);
        assert.equal(data.notifyPeriodMediumZone, 5);
        assert.equal(data.notifyPeriodBadZone, 6);
        assert.equal(data.measurementPeriodGoodZone, 1);
        assert.equal(data.measurementPeriodMediumZone, 2);
        assert.equal(data.measurementPeriodBadZone, 3);
        assert.equal(data.keepAliveTime, 10);
      });

      consume(data);
    });

    it("should decode a MClimate CO2 command response without keepalive", () => {
      const data = uplink("2b18");

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.autoZeroPeriod, 24);
      });

      consume(data);
    });

    it("should decode the MClimate CO2 buzzer settings as flat datapoints", () => {
      const data = uplink("27010203040506070809");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          buzzerDurationGoodBeeping: 1,
          buzzerDurationGoodLoud: 20,
          buzzerDurationGoodSilent: 30,
          buzzerDurationMediumBeeping: 4,
          buzzerDurationMediumLoud: 50,
          buzzerDurationMediumSilent: 60,
          buzzerDurationBadBeeping: 7,
          buzzerDurationBadLoud: 80,
          buzzerDurationBadSilent: 90,
        });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("0102");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 0102");
      });

      consume(data);
    });
  });
});
