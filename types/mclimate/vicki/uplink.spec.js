import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate Vicky uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let configurationSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
    lifecycleSchema = await loadSchema(`${__dirname}/lifecycle.schema.json`);
    configurationSchema = await loadSchema(
      `${__dirname}/configuration.schema.json`,
    );
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.targetTemperature, 29);
        assert.equal(value.data.sensorTemperature, 18.01);
        assert.equal(value.data.relativeHumidity, 46.88);
        assert.equal(value.data.motorRange, 300);
        assert.equal(value.data.motorPosition, 250);
        assert.equal(value.data.valveOpenness, 17);
        assert.equal(value.data.openWindow, false);
        assert.equal(value.data.childLock, true);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.5);
        assert.equal(value.data.highMotorConsumption, false);
        assert.equal(value.data.lowMotorConsumption, false);
        assert.equal(value.data.brokenSensor, false);
        assert.equal(value.data.calibrationFailed, false);
        assert.equal(value.data.attachedBackplate, false);
        assert.equal(value.data.perceiveAsOnline, false);
        assert.equal(value.data.antiFreezeProtection, false);
        assert.equal(value.data.d2dCommunicationReliable, false);
        assert.equal(value.data.batteryTooLow, false);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the status flags of a MClimate Vicky keepalive", () => {
      const data = uplink("811BAF4BAB2A1298B0");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.targetTemperature, 27);
        assert.equal(value.data.sensorTemperature, 25.88);
        assert.equal(value.data.relativeHumidity, 29.3);
        assert.equal(value.data.motorRange, 554);
        assert.equal(value.data.motorPosition, 427);
        assert.equal(value.data.valveOpenness, 23);
        assert.equal(value.data.openWindow, true);
        assert.equal(value.data.childLock, true);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.9);
        assert.equal(value.data.attachedBackplate, true);
        assert.equal(value.data.perceiveAsOnline, true);
        assert.equal(value.data.calibrationFailed, false);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode MClimate Vicky command responses followed by a keepalive", () => {
      const data = uplink("56011203042643811BAF4BAB2A129030");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.targetTemperature, 27);
        assert.equal(value.data.openWindow, false);
        assert.equal(value.data.childLock, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.9);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.ledDisplayTempUnits, 1);
        assert.equal(value.data.keepAliveTime, 3);
        assert.equal(value.data.hardwareVersion, 26);
        assert.equal(value.data.softwareVersion, 43);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a MClimate Vicky command response without keepalive", () => {
      const data = uplink("7200F1");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.htSensorTemperature, 24.1);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode settings as flat datapoints", () => {
      const data = uplink("1301041C231D0204811BAF4BAB2A129030");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data, {
          openWindowEnabled: true,
          openWindowDuration: 20,
          openWindowMotorPosition: 540,
          openWindowDelta: 3,
          watchDogConfirmedUplinks: 2,
          watchDogUnconfirmedUplinks: 4,
        });

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should skip a heating schedule answer and still decode the keepalive", () => {
      const data = uplink(
        "5A000600009B7F0000000000000000000000000000000000000000000000000000000000000000000000811BAF4BAB2A129030",
      );

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.targetTemperature, 27);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

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
