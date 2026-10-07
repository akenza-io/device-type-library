import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate CO2 uplink", () => {
  let defaultSchema = null;
  let configurationSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.co2, 697);
        assert.equal(value.data.temperature, 27.1);
        assert.equal(value.data.humidity, 42.19);
        assert.equal(value.data.batteryVoltage, 3.38);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode MClimate CO2 command responses followed by a keepalive", () => {
      const data = uplink("1f02bc03e82304050625010203120a0102A7027E53E4");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.co2, 679);
        assert.equal(value.data.temperature, 23.8);
        assert.equal(value.data.humidity, 32.42);
        assert.equal(value.data.batteryVoltage, 3.42);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.boundaryLevelGoodMedium, 700);
        assert.equal(value.data.boundaryLevelMediumBad, 1000);
        assert.equal(value.data.notifyPeriodGoodZone, 4);
        assert.equal(value.data.notifyPeriodMediumZone, 5);
        assert.equal(value.data.notifyPeriodBadZone, 6);
        assert.equal(value.data.measurementPeriodGoodZone, 1);
        assert.equal(value.data.measurementPeriodMediumZone, 2);
        assert.equal(value.data.measurementPeriodBadZone, 3);
        assert.equal(value.data.keepAliveTime, 10);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a MClimate CO2 command response without keepalive", () => {
      const data = uplink("2b18");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.autoZeroPeriod, 24);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the MClimate CO2 buzzer settings as flat datapoints", () => {
      const data = uplink("27010203040506070809");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
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

        validateSchema(value.data, configurationSchema, { throwError: true });
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
