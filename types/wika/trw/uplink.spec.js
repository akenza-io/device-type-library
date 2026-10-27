import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("WIKA TRW Uplink", () => {
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

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
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

  let errorSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode data message: Uplink example for 01 data message (temperature)", () => {
      const data = { data: { port: 1, payloadHex: "0100000cb3" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 0.751);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a data message with the measuring range set by custom fields", () => {
      const data = {
        data: { port: 1, payloadHex: "0100000cb3" },
        device: {
          customFields: { temperatureRangeStart: 0, temperatureRangeEnd: 100 },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 7.51);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for 02 data message (temperature)", () => {
      const data = { data: { port: 1, payloadHex: "0207001eb0" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 5.356);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for Process Alarm Message (temperature/low threshold)", () => {
      const data = { data: { port: 1, payloadHex: "031100010d73" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.lowThreshold, true);
        assert.equal(value.data.highThreshold, false);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);
        assert.equal(value.data.value, 0.943);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for Process Alarm Message (temperature/multi) (0x03 0F 00 20 2C A8 02 26 B8)", () => {
      const data = { data: { port: 1, payloadHex: "030f00202ca80226b8" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.lowThreshold, false);
        assert.equal(value.data.highThreshold, false);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, true);
        assert.equal(value.data.value, 8.932);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.lowThreshold, false);
        assert.equal(value.data.highThreshold, true);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);
        assert.equal(value.data.value, 7.412);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for Technical Alarm Message", () => {
      const data = { data: { port: 1, payloadHex: "0401000081" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.ssmCommunicationError, true);
        assert.equal(value.data.ssmIdentityError, true);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for Device Alarm Message", () => {
      const data = { data: { port: 1, payloadHex: "05000001" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.lowBatteryError, true);
        assert.equal(value.data.dutyCycleAlarm, false);
        assert.equal(value.data.configurationError, false);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode configuration status message: Device confirms configuration transaction 3 was accepted and applied (0x06 0x03 0x20)", () => {
      const data = { data: { port: 1, payloadHex: "060320" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.configurationId, 3);
        assert.equal(value.data.status, 2);
        assert.equal(value.data.statusDescription, "configuration applied");

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for Keep-Alive Alarm Message", () => {
      const data = { data: { port: 1, payloadHex: "08003f" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 63);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for Measurement Input Failure Alarm Message", () => {
      const data = { data: { port: 1, payloadHex: "0900000004" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.mvStatError, false);
        assert.equal(value.data.mvStatWarning, false);
        assert.equal(value.data.mvStatLimHi, true);
        assert.equal(value.data.mvStatLimLo, false);
        assert.equal(value.data.mvStatWarning2, false);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for Device Identification Message", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0700104202000100314132423343344435453600000000412000000101",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productId, 16);
        assert.equal(value.data.productIdName, "NETRIS©1 BLE+LPWAN");
        assert.equal(value.data.productSubId, 66);
        assert.equal(value.data.productSubIdName, "LoRa TRW");
        assert.equal(value.data.wirelessModuleFirmwareVersion, "0.2.0");
        assert.equal(value.data.wirelessModuleHardwareVersion, "0.1.0");
        assert.equal(value.data.serialNumber, "1A2B3C4D5E6");
        assert.equal(value.data.measurementRangeStart, 0);
        assert.equal(value.data.measurementRangeEnd, 10);
        assert.equal(value.data.measurand, 1);
        assert.equal(value.data.measurandName, "Temperature");
        assert.equal(value.data.unit, 1);
        assert.equal(value.data.unitName, "°C");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode TULIP3 data message: should decode normal data message with compact encoding", () => {
      const data = { data: { port: 1, payloadHex: "1001062e97" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 9.427);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 process alarm message: low threshold alarm of 2nd channel", () => {
      const data = { data: { port: 1, payloadHex: "12010480" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "temperature");
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
        assert.equal(value.data.sensorCommunicationError, true);
        assert.equal(value.data.sensorInternalError, false);
        assert.equal(value.data.sensorIdentificationError, false);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 device alarm message: Channel alarms - minimum physical limit for channel 1 sensor 1 (pressure) and maximum physical limit for channel 2 sensor 1 (device temperature)", () => {
      const data = { data: { port: 1, payloadHex: "1303000010" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.shortCondition, false);
        assert.equal(value.data.openCondition, false);
        assert.equal(value.data.outOfMinMeasurementRange, false);
        assert.equal(value.data.outOfMaxMeasurementRange, false);
        assert.equal(value.data.outOfMinPhysicalSensorLimit, true);
        assert.equal(value.data.outOfMaxPhysicalSensorLimit, false);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Should parse partial registers", () => {
      const data = {
        data: { port: 1, payloadHex: "140100041e02010107c1010f020101" },
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
        assert.equal(value.data.sensorExistingChannelsChannel2, false);
        assert.equal(value.data.sensorExistingChannelsChannel3, false);
        assert.equal(value.data.sensorExistingChannelsChannel4, false);
        assert.equal(value.data.sensorExistingChannelsChannel5, false);
        assert.equal(value.data.sensorExistingChannelsChannel6, false);
        assert.equal(value.data.sensorExistingChannelsChannel7, false);
        assert.equal(value.data.sensorExistingChannelsChannel8, false);
        assert.equal(value.data.temperatureMeasurand, "Temperature");
        assert.equal(value.data.temperatureUnit, "°C");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Should parse register update message", () => {
      const data = { data: { port: 1, payloadHex: "14040f2102" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.temperatureUnit, "°F");

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

    it("should decode TULIP3 configuration message: Should parse configuration register update message", () => {
      const data = {
        data: { port: 1, payloadHex: "150109010000040000465001020000" },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(
          value.data.temperatureProcessAlarmEnabledLowThreshold,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledHighThreshold,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledFallingSlope,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledRisingSlope,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledLowThresholdWithDelay,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledHighThresholdWithDelay,
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
          value.data.temperatureProcessAlarmEnabledLowThreshold,
          true,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledHighThreshold,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledFallingSlope,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledRisingSlope,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledLowThresholdWithDelay,
          false,
        );
        assert.equal(
          value.data.temperatureProcessAlarmEnabledHighThresholdWithDelay,
          false,
        );
        assert.equal(value.data.temperatureProcessAlarmDeadBand, 0.166);
        assert.equal(value.data.temperatureLowThresholdAlarmValue, 0.3);

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

    it("should decode TULIP3 data message: Data message with alarm active (0x1101)", () => {
      const data = { data: { port: 1, payloadHex: "1101062e97" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 9.427);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 fetch additional downlink message (0x1702)", () => {
      const data = { data: { port: 1, payloadHex: "1702" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.fetchAdditionalDownlink, true);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should emit an error for an unsupported message", () => {
      const data = { data: { port: 1, payloadHex: "000000" } };

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
  });
});
