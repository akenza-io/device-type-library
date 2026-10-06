import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate Flood Sensor uplink", () => {
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
        deviceId: "70B3D52DD3000001",
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
      assert.equal(value.data.deviceId, "70B3D52DD3000001");
      assert.equal(value.data.payloadHex, payloadHex);
      assert.equal(value.data.port, 2);
      assert.equal(value.data.frameCountUp, 6);
      assert.equal(value.data.rssi, -90);
      assert.equal(value.data.spreadingFactor, 7);

      validateSchema(value.data, mclimateSchema, { throwError: true });
    });
  }

  describe("consume()", () => {
    it("should decode a MClimate Flood Sensor keepalive", () => {
      const data = uplink("08be10");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.messageType, "KEEPALIVE");
        assert.equal(value.data.boxTamper, true);
        assert.equal(value.data.flood, false);
        assert.equal(value.data.batteryVoltage, 3.04);
        assert.equal(value.data.temperature, 16);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectRawPayload("08be10");

      consume(data);
    });

    it("should decode a MClimate Flood Sensor flood alarm", () => {
      const data = uplink("4abe0f");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.messageType, "FLOOD_DETECTED");
        assert.equal(value.data.boxTamper, true);
        assert.equal(value.data.flood, true);
        assert.equal(value.data.batteryVoltage, 3.04);
        assert.equal(value.data.temperature, 15);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectRawPayload("4abe0f");

      consume(data);
    });

    it("should decode a short MClimate Flood Sensor keepalive without temperature", () => {
      const data = uplink("22be");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.messageType, "TEST_BUTTON_PRESSED");
        assert.equal(value.data.boxTamper, false);
        assert.equal(value.data.flood, true);
        assert.equal(value.data.batteryVoltage, 3.04);
        assert.notProperty(value.data, "temperature");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectRawPayload("22be");

      consume(data);
    });

    it("should decode MClimate Flood Sensor command responses", () => {
      const data = uplink("060307021509011200f014014abe0f");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.messageType, "FLOOD_DETECTED");
        assert.equal(value.data.flood, true);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.alarmDuration, 3);
        assert.deepEqual(value.data.deviceVersions, {
          hardware: 2,
          software: 15,
        });
        assert.equal(value.data.floodEventSendTime, 1);
        assert.equal(value.data.keepAliveTime, 240);
        assert.equal(value.data.floodEventUplinkType, 1);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      expectRawPayload("060307021509011200f014014abe0f");

      consume(data);
    });

    it("should still forward the raw payload if it cannot be decoded", () => {
      const data = uplink("08");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Could not decode 08: payload too short");
      });

      expectRawPayload("08");

      consume(data);
    });
  });
});
