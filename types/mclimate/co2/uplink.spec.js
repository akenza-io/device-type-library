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
  let mclimateSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
    configurationSchema = await loadSchema(
      `${__dirname}/configuration.schema.json`,
    );
    mclimateSchema = await loadSchema(`${__dirname}/raw_payload.schema.json`);
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

  function expectRawPayload(payloadHex) {
    expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.equal(value.topic, "raw_payload");
      assert.equal(value.data.deviceId, "70B3D52DD3000004");
      assert.equal(value.data.payloadHex, payloadHex);
      assert.equal(value.data.port, 2);
      assert.equal(value.data.frameCountUp, 6);
      assert.equal(value.data.rssi, -90);
      assert.equal(value.data.spreadingFactor, 7);

      validateSchema(value.data, mclimateSchema, { throwError: true });
    });
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

      expectRawPayload("0102b9029f6cde");

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
        assert.deepEqual(value.data.boundaryLevels, {
          goodMedium: 700,
          mediumBad: 1000,
        });
        assert.deepEqual(value.data.notifyPeriod, {
          goodZone: 4,
          mediumZone: 5,
          badZone: 6,
        });
        assert.deepEqual(value.data.measurementPeriod, {
          goodZone: 1,
          mediumZone: 2,
          badZone: 3,
        });
        assert.equal(value.data.keepAliveTime, 10);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectRawPayload("1f02bc03e82304050625010203120a0102A7027E53E4");

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

      expectRawPayload("2b18");

      consume(data);
    });

    it("should still forward the raw payload if it cannot be decoded", () => {
      const data = uplink("0102");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 0102");
      });

      expectRawPayload("0102");

      consume(data);
    });
  });
});
