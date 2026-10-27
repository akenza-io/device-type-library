import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate Button uplink", () => {
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
        deviceId: "70B3D52DD3000003",
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
    it("should decode MClimate Button payload", () => {
      const data = uplink("01db011a01");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.352);
        assert.equal(data.buttonPressed, "SINGLE_PRESS");
        assert.equal(data.temperature, 28.2);
        assert.equal(data.thermistorOperational, true);
      });

      consume(data);
    });

    it("should decode MClimate Button command responses followed by a keepalive", () => {
      const data = uplink("B10001AA120204121101b000d200");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.008);
        assert.equal(data.buttonPressed, "NO_PRESS");
        assert.equal(data.temperature, 21);
        assert.equal(data.thermistorOperational, true);
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.singlePressEventCounter, 426);
        assert.equal(data.keepAliveTime, 2);
        assert.equal(data.hardwareVersion, 12);
        assert.equal(data.softwareVersion, 11);
      });

      consume(data);
    });

    it("should decode a MClimate Button command response without keepalive", () => {
      const data = uplink("1f01");

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.sendEventLater, 1);
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("01db");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 01db");
      });

      consume(data);
    });
  });
});
