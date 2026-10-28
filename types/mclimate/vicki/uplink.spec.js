import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate Vicky uplink", () => {
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
        deviceId: "70B3D52DD300550E",
      },
      uplinkMetrics: {
        timestamp: "1670849361.1912086",
        port: 2,
        frameCountUp: 6,
        rssi: -119,
        snr: 2,
        sf: 12,
      },
    };
  }

  describe("consume()", () => {
    it("should decode MClimate Vicky payload", () => {
      const data = uplink("011D5A78FA2C01F080");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.targetTemperature, 29);
        assert.equal(data.sensorTemperature, 18.01);
        assert.equal(data.relativeHumidity, 46.88);
        assert.equal(data.motorRange, 300);
        assert.equal(data.motorPosition, 250);
        assert.equal(data.valveOpenness, 17);
        assert.equal(data.openWindow, false);
        assert.equal(data.childLock, true);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.5);
        assert.equal(data.highMotorConsumption, false);
        assert.equal(data.lowMotorConsumption, false);
        assert.equal(data.brokenSensor, false);
        assert.equal(data.calibrationFailed, false);
        assert.equal(data.attachedBackplate, false);
        assert.equal(data.perceiveAsOnline, false);
        assert.equal(data.antiFreezeProtection, false);
        assert.equal(data.d2dCommunicationReliable, false);
        assert.equal(data.batteryTooLow, false);
      });

      consume(data);
    });

    it("should decode the status flags of a MClimate Vicky keepalive", () => {
      const data = uplink("811BAF4BAB2A1298B0");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.targetTemperature, 27);
        assert.equal(data.sensorTemperature, 25.88);
        assert.equal(data.relativeHumidity, 29.3);
        assert.equal(data.motorRange, 554);
        assert.equal(data.motorPosition, 427);
        assert.equal(data.valveOpenness, 23);
        assert.equal(data.openWindow, true);
        assert.equal(data.childLock, true);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.9);
        assert.equal(data.attachedBackplate, true);
        assert.equal(data.perceiveAsOnline, true);
        assert.equal(data.calibrationFailed, false);
      });

      consume(data);
    });

    it("should decode MClimate Vicky command responses followed by a keepalive", () => {
      const data = uplink("56011203042643811BAF4BAB2A129030");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.targetTemperature, 27);
        assert.equal(data.openWindow, false);
        assert.equal(data.childLock, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.9);
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.ledDisplayTempUnits, 1);
        assert.equal(data.keepAliveTime, 3);
        assert.equal(data.hardwareVersion, 26);
        assert.equal(data.softwareVersion, 43);
      });

      consume(data);
    });

    it("should decode a MClimate Vicky command response without keepalive", () => {
      const data = uplink("7200F1");

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.htSensorTemperature, 24.1);
      });

      consume(data);
    });

    it("should decode settings as flat datapoints", () => {
      const data = uplink("1301041C231D0204811BAF4BAB2A129030");

      expectSample("default", defaultSchema);

      expectSample("lifecycle", lifecycleSchema);

      expectSample("configuration", configurationSchema, (data) => {
        assert.deepEqual(data, {
          openWindowEnabled: true,
          openWindowDuration: 20,
          openWindowMotorPosition: 540,
          openWindowDelta: 3,
          watchDogConfirmedUplinks: 2,
          watchDogUnconfirmedUplinks: 4,
        });
      });

      consume(data);
    });

    it("should skip a heating schedule answer and still decode the keepalive", () => {
      const data = uplink(
        "5A000600009B7F0000000000000000000000000000000000000000000000000000000000000000000000811BAF4BAB2A129030",
      );

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.targetTemperature, 27);
      });

      expectSample("lifecycle", lifecycleSchema);

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("811B");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 811B");
      });

      consume(data);
    });
  });
});
