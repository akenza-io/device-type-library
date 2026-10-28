import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate 16ADS uplink", () => {
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
    it("should decode a MClimate 16ADS keepalive", () => {
      const data = uplink("011E00");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          internalTemperature: 30,
          relayOn: false,
        });
      });

      consume(data);
    });

    it("should decode MClimate 16ADS command responses followed by a keepalive", () => {
      const data = uplink("041010120A19781B001D02181F5F465F00011E00");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          internalTemperature: 30,
          relayOn: false,
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          hardwareVersion: 10,
          softwareVersion: 10,
          keepAliveTime: 10,
          joinRetryPeriod: 10,
          uplinkType: 0,
          watchDogConfirmedUplinks: 2,
          watchDogUnconfirmedUplinks: 24,
          overheatingThresholdTrigger: 95,
          overheatingThresholdRecovery: 70,
          relayRecoveryState: 0,
        });
      });

      consume(data);
    });

    it("should decode a MClimate 16ADS command response without keepalive", () => {
      const data = uplink("B101");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          relayState: true,
        });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("01");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 01");
      });

      consume(data);
    });
  });
});
