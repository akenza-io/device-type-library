import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate PIR Mini uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let eventSchema = null;
  let configurationSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    eventSchema = loadSchema(`${import.meta.dirname}/event.schema.json`);
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
    it("should decode a MClimate PIR Mini keepalive", () => {
      const data = uplink("0102888002F1C80101AF");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 24.8,
          humidity: 50,
          occupied: true,
          motion: 431,
          light: 753,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.33,
          lightSensorStatus: "OK",
        });
      });

      consume(data);
    });

    it("should decode a MClimate PIR Mini keepalive with a disabled light sensor", () => {
      const data = uplink("01028880FFFFC80101AF");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 24.8,
          humidity: 50,
          occupied: true,
          motion: 431,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.33,
          lightSensorStatus: "DISABLED",
        });
      });

      consume(data);
    });

    it("should decode a MClimate PIR Mini occupancy event", () => {
      const data = uplink("3A0102809903E1CC010012");

      expectSample("event", eventSchema, (data) => {
        assert.deepEqual(data, {
          event: "OCCUPIED",
        });
      });

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 24,
          humidity: 59.77,
          occupied: true,
          motion: 18,
          light: 993,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.36,
          lightSensorStatus: "OK",
        });
      });

      consume(data);
    });

    it("should decode MClimate PIR Mini command responses followed by a keepalive", () => {
      const data = uplink("3F034200B40102809903E1CC010012");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          temperature: 24,
          humidity: 59.77,
          occupied: true,
          motion: 18,
          light: 993,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.36,
          lightSensorStatus: "OK",
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          pirOperationMode: 3,
          pirBlindTime: 180,
        });
      });

      consume(data);
    });

    it("should decode a MClimate PIR Mini command response without keepalive", () => {
      const data = uplink("39000F");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          occupancyTimeout: 15,
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
