import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate HT uplink", () => {
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
        deviceId: "70B3D52DD3000002",
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
      assert.equal(value.data.deviceId, "70B3D52DD3000002");
      assert.equal(value.data.payloadHex, payloadHex);
      assert.equal(value.data.port, 2);
      assert.equal(value.data.frameCountUp, 6);
      assert.equal(value.data.rssi, -90);
      assert.equal(value.data.spreadingFactor, 7);

      validateSchema(value.data, mclimateSchema, { throwError: true });
    });
  }

  describe("consume()", () => {
    it("should decode MClimate HT payload", () => {
      const data = uplink("0102a16af60400");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 27.3);
        assert.equal(value.data.humidity, 41.41);
        assert.equal(value.data.batteryVoltage, 3.568);
        assert.equal(value.data.thermistorOperational, false);
        assert.notProperty(value.data, "extTemperature");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectRawPayload("0102a16af60400");

      consume(data);
    });

    it("should decode the external thermistor of a MClimate HT payload", () => {
      const data = uplink("0102a16af60123");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.thermistorOperational, true);
        assert.equal(value.data.extTemperature, 29.1);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectRawPayload("0102a16af60123");

      consume(data);
    });

    it("should decode MClimate HT command responses followed by a keepalive", () => {
      const data = uplink("34010332010304201512050102764DE90400");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 23);
        assert.equal(value.data.humidity, 30.08);
        assert.equal(value.data.batteryVoltage, 3.464);
        assert.equal(value.data.thermistorOperational, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data.humidityCompensation, {
          negativeCompensation: true,
          compensation: 3,
        });
        assert.deepEqual(value.data.temperatureCompensation, {
          negativeCompensation: true,
          compensation: 0.3,
        });
        assert.deepEqual(value.data.deviceVersions, {
          hardware: 20,
          software: 15,
        });
        assert.equal(value.data.keepAliveTime, 5);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectRawPayload("34010332010304201512050102764DE90400");

      consume(data);
    });

    it("should decode a MClimate HT command response without keepalive", () => {
      const data = uplink("AA01");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.d2dCommunicationState, true);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectRawPayload("AA01");

      consume(data);
    });

    it("should still forward the raw payload if it cannot be decoded", () => {
      const data = uplink("01");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 01");
      });

      expectRawPayload("01");

      consume(data);
    });
  });
});
