import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate Open/Close Sensor uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
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
    it("should decode a MClimate Open/Close Sensor keepalive", () => {
      const data = uplink("01AB00D91B5CAE01");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          messageType: "KEEPALIVE",
          open: true,
          eventCount: 1793198,
          temperature: 21.7,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 2.968,
          thermistorOperational: true,
        });
      });

      consume(data);
    });

    it("should decode a MClimate Open/Close Sensor open/close event with a negative temperature", () => {
      const data = uplink("20AB08321B5CAF00");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          messageType: "OPEN_CLOSE",
          open: false,
          eventCount: 1793199,
          temperature: -5,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 2.968,
          thermistorOperational: true,
        });
      });

      consume(data);
    });

    it("should decode MClimate Open/Close Sensor command responses followed by an event", () => {
      const data = uplink("04131212F019781B001D02181F0020E200D700000100");

      expectSample("default", defaultSchema, (data) => {
        assert.deepEqual(data, {
          messageType: "OPEN_CLOSE",
          open: false,
          eventCount: 1,
          temperature: 21.5,
        });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.deepEqual(data, {
          batteryVoltage: 3.408,
          thermistorOperational: true,
        });
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          hardwareVersion: 13,
          softwareVersion: 12,
          keepAliveTime: 240,
          joinRetryPeriod: 10,
          uplinkType: 0,
          watchDogConfirmedUplinks: 2,
          watchDogUnconfirmedUplinks: 24,
          notificationBlindTime: 0,
        });
      });

      consume(data);
    });

    it("should decode a MClimate Open/Close Sensor command response without keepalive", () => {
      const data = uplink("1F05");

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          notificationBlindTime: 5,
        });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("01AB00");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 01AB00");
      });

      consume(data);
    });
  });
});
