import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate 16ASPM uplink", () => {
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
    it("should decode a MClimate 16ASPM keepalive", () => {
      const data = uplink("011C034A241805D9E7195201");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          internalTemperature: 28,
          energy: 55190.552,
          power: 1497,
          voltage: 231,
          current: 6482,
          relayOn: true,
        });
      });

      consume(data);
    });

    it("should decode a MClimate 16ASPM keepalive with a negative temperature", () => {
      const data = uplink("0185034A241805D9E7195200");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          internalTemperature: -5,
          energy: 55190.552,
          power: 1497,
          voltage: 231,
          current: 6482,
          relayOn: false,
        });
      });

      consume(data);
    });

    it("should decode MClimate 16ASPM command responses followed by a keepalive", () => {
      const data = uplink("54015C015A01011C034A241805D9E7195201");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          internalTemperature: 28,
          energy: 55190.552,
          power: 1497,
          voltage: 231,
          current: 6482,
          relayOn: true,
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          relayStateChangeReason: 1,
          ledIndicationMode: 1,
          afterOverheatingProtectionRecovery: 1,
        });
      });

      consume(data);
    });

    it("should decode a manual relay state change", () => {
      const data = uplink("5D01011C034A241805D9E7195201");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          internalTemperature: 28,
          energy: 55190.552,
          power: 1497,
          voltage: 231,
          current: 6482,
          relayOn: true,
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          manualChangeRelayState: 1,
        });
      });

      consume(data);
    });

    it("should decode a MClimate 16ASPM command response without keepalive", () => {
      const data = uplink("6202000C");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          overcurrentEventCount: 2,
          overcurrentEventCurrent: 12,
        });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("011C03");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 011C03");
      });

      consume(data);
    });
  });
});
