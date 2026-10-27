import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("WIKA PGW23.100.11 Uplink", () => {
  let consume = null;
  before(() => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
  });

  let defaultSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let errorSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  let processAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/process_alarm.schema.json`).then(
      (parsedSchema) => {
        processAlarmSchema = parsedSchema;
        done();
      },
    );
  });

  let technicalAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/technical_alarm.schema.json`).then(
      (parsedSchema) => {
        technicalAlarmSchema = parsedSchema;
        done();
      },
    );
  });

  let deviceAlarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/device_alarm.schema.json`).then((parsedSchema) => {
      deviceAlarmSchema = parsedSchema;
      done();
    });
  });

  let configurationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/configuration.schema.json`).then(
      (parsedSchema) => {
        configurationSchema = parsedSchema;
        done();
      },
    );
  });

  let deviceInformationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/device_information.schema.json`).then(
      (parsedSchema) => {
        deviceInformationSchema = parsedSchema;
        done();
      },
    );
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode data message: Uplink example for 01 data message with 2 active measurement channels and battery voltage", () => {
      const data = { data: { port: 1, payloadHex: "01002309b9226e" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, -0.011);
        assert.equal(value.data.deviceTemperature, 23.14);
        assert.equal(value.data.batteryVoltage, 3.5);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a data message with the measuring range set by custom fields", () => {
      const data = {
        data: { port: 1, payloadHex: "01002309b9226e" },
        device: {
          customFields: { pressureRangeStart: 0, pressureRangeEnd: 100 },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, -0.11);
        assert.equal(value.data.deviceTemperature, 23.14);
        assert.equal(value.data.batteryVoltage, 3.5);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for 02 data message with 2 active measurement channels with alarm present", () => {
      const data = { data: { port: 1, payloadHex: "02002309b9226e" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, -0.011);
        assert.equal(value.data.deviceTemperature, 23.14);
        assert.equal(value.data.batteryVoltage, 3.5);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for 00 data message", () => {
      const data = { data: { port: 1, payloadHex: "0000002e971253" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "error");
        assert.include(
          value.data.errorMessage,
          "Message type 0x00 is not supported",
        );

        validateSchema(value.data, errorSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode process alarm message: Uplink example for alert message rising threshold", () => {
      const data = { data: { port: 1, payloadHex: "03000119b4" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "pressure");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.lowThreshold, false);
        assert.equal(value.data.highThreshold, true);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);
        assert.equal(value.data.value, 4.08);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode technical message: Uplink example for alert message general instrument error", () => {
      const data = { data: { port: 1, payloadHex: "04000119b40932c8" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "pressure");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.causeOfFailure, "general failure");
        assert.equal(value.data.value, 4.08);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "deviceTemperature");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.causeOfFailure, "general failure");
        assert.equal(value.data.value, 65);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode device alarm message: Uplink example for low temperature", () => {
      const data = { data: { port: 1, payloadHex: "050040ec" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.causeOfFailure, "device dependent");
        assert.equal(value.data.alarmType, "low temperature alarm");
        assert.equal(value.data.value, -20);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode configuration status message: Uplink example for configuration successful", () => {
      const data = { data: { port: 1, payloadHex: "060100" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.configurationId, 1);
        assert.equal(value.data.status, 0);
        assert.equal(value.data.statusDescription, "packet received");
        assert.equal(value.data.lastPacketIndexReceived, 0);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode device identification message: Uplink example for metrology information message", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "07000a020001000500010050484f454e49585f464200020000000000002041000020c2000070420720",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productIdName, "PGW23.100.11");
        assert.equal(value.data.productId, 10);
        assert.equal(value.data.wirelessModuleFirmwareVersion, "0.2.0");
        assert.equal(value.data.wirelessModuleHardwareVersion, "0.1.0");
        assert.equal(value.data.sensorModuleFirmwareVersion, "0.5.0");
        assert.equal(value.data.sensorModuleHardwareVersion, "0.1.0");
        assert.equal(value.data.serialNumber, "PHOENIX_FB");
        assert.equal(value.data.pressureType, "relative");
        assert.equal(value.data.measurementRangeStartPressure, 0);
        assert.equal(value.data.measurementRangeEndPressure, 10);
        assert.equal(value.data.measurementRangeStartDeviceTemperature, -40);
        assert.equal(value.data.measurementRangeEndDeviceTemperature, 60);
        assert.equal(value.data.pressureUnit, 7);
        assert.equal(value.data.pressureUnitName, "bar");
        assert.equal(value.data.deviceTemperatureUnit, 32);
        assert.equal(value.data.deviceTemperatureUnitName, "°C");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode keep-alive message: Uplink example for keep alive", () => {
      const data = { data: { port: 1, payloadHex: "08003f" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevelNewEvent, false);
        assert.equal(value.data.batteryLevel, 63);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
