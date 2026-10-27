import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate Flood Sensor uplink", () => {
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

  describe("consume()", () => {
    it("should decode a MClimate Flood Sensor keepalive", () => {
      const data = uplink("08be10");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.messageType, "KEEPALIVE");
        assert.equal(data.boxTamper, true);
        assert.equal(data.flood, false);
        assert.equal(data.batteryVoltage, 3.04);
        assert.equal(data.temperature, 16);
      });

      consume(data);
    });

    it("should decode a MClimate Flood Sensor flood alarm", () => {
      const data = uplink("4abe0f");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.messageType, "FLOOD_DETECTED");
        assert.equal(data.boxTamper, true);
        assert.equal(data.flood, true);
        assert.equal(data.batteryVoltage, 3.04);
        assert.equal(data.temperature, 15);
      });

      consume(data);
    });

    it("should decode a short MClimate Flood Sensor keepalive without temperature", () => {
      const data = uplink("22be");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.messageType, "TEST_BUTTON_PRESSED");
        assert.equal(data.boxTamper, false);
        assert.equal(data.flood, true);
        assert.equal(data.batteryVoltage, 3.04);
        assert.notProperty(data, "temperature");
      });

      consume(data);
    });

    it("should decode MClimate Flood Sensor command responses", () => {
      const data = uplink("060307021509011200f014014abe0f");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.messageType, "FLOOD_DETECTED");
        assert.equal(data.flood, true);
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.alarmDuration, 3);
        assert.equal(data.hardwareVersion, 2);
        assert.equal(data.softwareVersion, 15);
        assert.equal(data.floodEventSendTime, 1);
        assert.equal(data.keepAliveTime, 240);
        assert.equal(data.floodEventUplinkType, 1);
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("08");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Could not decode 08: payload too short");
      });

      consume(data);
    });
  });
});
