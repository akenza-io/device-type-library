import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("WIKA NETRIS F Uplink", () => {
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
    it("should decode data message: Uplink example for 01 data message with 2 active measurement channels", () => {
      const data = { data: { port: 1, payloadHex: "0141261c301a88" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.measurement, -17.75);
        assert.equal(value.data.deviceTemperature, 21.526);
        assert.equal(value.data.batteryVoltage, 3.8);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a data message with the measuring range set by custom fields", () => {
      const data = {
        data: { port: 1, payloadHex: "0141261c301a88" },
        device: {
          customFields: { measurementRangeStart: 0, measurementRangeEnd: 100 },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.measurement, 47.16);
        assert.equal(value.data.deviceTemperature, 21.526);
        assert.equal(value.data.batteryVoltage, 3.8);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for 02 data message with 2 active measurement channels", () => {
      const data = { data: { port: 1, payloadHex: "02002309b91af0" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.measurement, -313.1875);
        assert.equal(value.data.deviceTemperature, 23.138);
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

    it("should decode process alarm message: Uplink example for alert message low threshold", () => {
      const data = { data: { port: 1, payloadHex: "03000119b4" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "measurement");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.lowThreshold, true);
        assert.equal(value.data.highThreshold, false);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);
        assert.equal(value.data.value, -57.5);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode technical message: Uplink example for alert message general instrument error", () => {
      const data = { data: { port: 1, payloadHex: "040001" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.alarmType, "Punctual sensor error");

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode radio unit message: Uplink example for Battery is low", () => {
      const data = { data: { port: 1, payloadHex: "0500001c" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.causeOfFailure, "generic");
        assert.equal(value.data.alarmType, "low battery alarm");
        assert.equal(value.data.batteryValue, 2.8);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode configuration status message: Uplink example for configuration successful", () => {
      const data = { data: { port: 1, payloadHex: "060f20" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.configurationId, 15);
        assert.equal(value.data.status, 2);
        assert.equal(value.data.statusDescription, "configuration applied");

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Radio unit identification message: Uplink example for metrology information message", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "07410b0002000100323230313038303234370002c39c4000439c4000c234000042dc0000b920",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productId, 11);
        assert.equal(value.data.productIdName, "NETRIS_F");
        assert.equal(value.data.productSubId, 0);
        assert.equal(value.data.productSubIdName, "LoRaWAN");
        assert.equal(value.data.wirelessModuleFirmwareVersion, "0.2.0");
        assert.equal(value.data.wirelessModuleHardwareVersion, "0.1.0");
        assert.equal(value.data.serialNumber, "2201080247");
        assert.equal(value.data.measurementType, "relative");
        assert.equal(value.data.measurementRangeStart, -312.5);
        assert.equal(value.data.measurementRangeEnd, 312.5);
        assert.equal(value.data.measurementRangeStartDeviceTemperature, -45);
        assert.equal(value.data.measurementRangeEndDeviceTemperature, 110);
        assert.equal(value.data.measurementUnit, 185);
        assert.equal(value.data.unitName, "µeps");
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

    it("should decode TULIP3 data message: should decode normal data message with compact encoding", () => {
      const data = { data: { port: 1, payloadHex: "1001062e970e152f" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.measurement, 276.6875);
        assert.equal(value.data.deviceTemperature, 0.3065);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 process alarm message: low threshold alarm of 2nd channel", () => {
      const data = { data: { port: 1, payloadHex: "12010880" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "deviceTemperature");
        assert.equal(value.data.lowThreshold, true);
        assert.equal(value.data.highThreshold, false);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 device alarm message: Communication module alarms - low voltage and air time limitation", () => {
      const data = { data: { port: 1, payloadHex: "13010028" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.airTimeLimitation, true);
        assert.equal(value.data.memoryError, false);
        assert.equal(value.data.lowVoltage, true);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 device alarm message: Sensor module alarms - sensor communication error", () => {
      const data = { data: { port: 1, payloadHex: "1302000001" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.sensor, "sensor1");
        assert.equal(value.data.sensorBusy, false);
        assert.equal(value.data.sensorMemoryIntegrity, false);
        assert.equal(value.data.sensorALUSaturation, false);
        assert.equal(value.data.sensorCommunicationError, true);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 device alarm message: Channel alarms - minimum physical limit for channel 1 sensor 1 (strain) and maximum physical limit for channel 2 sensor 1 (device temperature)", () => {
      const data = { data: { port: 1, payloadHex: "1303000010080020" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "measurement");
        assert.equal(value.data.outOfMinPhysicalSensorLimit, true);
        assert.equal(value.data.outOfMaxPhysicalSensorLimit, false);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "deviceTemperature");
        assert.equal(value.data.outOfMinPhysicalSensorLimit, false);
        assert.equal(value.data.outOfMaxPhysicalSensorLimit, true);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Should parse partial registers", () => {
      const data = {
        data: { port: 1, payloadHex: "140100041e02010107c1030f021db915420101" },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productId, 30);
        assert.equal(value.data.productSubId, "LoRaWAN class A");
        assert.equal(value.data.channelPlan, 1);
        assert.equal(value.data.connectedSensorsSensor1, true);
        assert.equal(value.data.connectedSensorsSensor2, false);
        assert.equal(value.data.connectedSensorsSensor3, false);
        assert.equal(value.data.connectedSensorsSensor4, false);
        assert.equal(value.data.sensorExistingChannelsChannel1, true);
        assert.equal(value.data.sensorExistingChannelsChannel2, true);
        assert.equal(value.data.sensorExistingChannelsChannel3, false);
        assert.equal(value.data.sensorExistingChannelsChannel4, false);
        assert.equal(value.data.sensorExistingChannelsChannel5, false);
        assert.equal(value.data.sensorExistingChannelsChannel6, false);
        assert.equal(value.data.sensorExistingChannelsChannel7, false);
        assert.equal(value.data.sensorExistingChannelsChannel8, false);
        assert.equal(value.data.measurementMeasurand, "Strain");
        assert.equal(value.data.measurementUnit, "µeps");
        assert.equal(value.data.deviceTemperatureMeasurand, "Temperature");
        assert.equal(value.data.deviceTemperatureUnit, "°C");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Should parse register update message", () => {
      const data = { data: { port: 1, payloadHex: "14040f021db9" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.measurementMeasurand, "Strain");
        assert.equal(value.data.measurementUnit, "µeps");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Contains Serial number", () => {
      const data = {
        data: { port: 1, payloadHex: "140201ab3141303132334142433435" },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.serialNumberPart1, "1A012");
        assert.equal(value.data.serialNumberPart2, "3ABC45");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Should decode identification register write response", () => {
      const data = { data: { port: 1, payloadHex: "14030001000300" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data.frames, [
          {
            frameNumber: 0,
            status: "Configuration received and applied with success",
          },
        ]);
        assert.equal(value.data.revisionCounter, 3);
        assert.equal(value.data.totalWrongFrames, 0);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 configuration message: Should parse register update message", () => {
      const data = {
        data: { port: 1, payloadHex: "150110410000040000465001020000" },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(
          value.data.deviceTemperatureProcessAlarmEnabledLowThreshold,
          false,
        );
        assert.equal(
          value.data.deviceTemperatureProcessAlarmEnabledHighThreshold,
          false,
        );
        assert.equal(
          value.data.deviceTemperatureProcessAlarmEnabledFallingSlope,
          false,
        );
        assert.equal(
          value.data.deviceTemperatureProcessAlarmEnabledRisingSlope,
          false,
        );
        assert.equal(
          value.data.deviceTemperatureProcessAlarmEnabledLowThresholdWithDelay,
          false,
        );
        assert.equal(
          value.data.deviceTemperatureProcessAlarmEnabledHighThresholdWithDelay,
          false,
        );
        assert.equal(value.data.measuringPeriodAlarmOff, 18000);
        assert.equal(value.data.transmissionRateAlarmOff, 0);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 Configuration message: Should parse read register response message part 1", () => {
      const data = {
        data: { port: 1, payloadHex: "15020909803e29fbe73e99999a" },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(
          value.data.measurementProcessAlarmEnabledLowThreshold,
          true,
        );
        assert.equal(
          value.data.measurementProcessAlarmEnabledHighThreshold,
          false,
        );
        assert.equal(
          value.data.measurementProcessAlarmEnabledFallingSlope,
          false,
        );
        assert.equal(
          value.data.measurementProcessAlarmEnabledRisingSlope,
          false,
        );
        assert.equal(
          value.data.measurementProcessAlarmEnabledLowThresholdWithDelay,
          false,
        );
        assert.equal(
          value.data.measurementProcessAlarmEnabledHighThresholdWithDelay,
          false,
        );
        assert.equal(value.data.measurementProcessAlarmDeadBand, 0.166);
        assert.equal(value.data.measurementLowThresholdAlarmValue, 0.3);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 Configuration message: Should parse write register response message part 1", () => {
      const data = { data: { port: 1, payloadHex: "15030000" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.deepEqual(value.data.frames, [
          { frameNumber: 0, status: "Configuration received but not applied" },
        ]);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 keep alive message: Battery powered, 2 configs have been made and battery at 100%", () => {
      const data = { data: { port: 1, payloadHex: "160160000264" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.mainPowered, false);
        assert.equal(value.data.ableToComputeBatteryLevel, true);
        assert.equal(value.data.hasCommunicationModuleRestarted, true);
        assert.equal(value.data.revisionCounter, 2);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
