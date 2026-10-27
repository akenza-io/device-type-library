import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("WIKA TGU + NETRIS3 Uplink", () => {
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

  let configurationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/configuration.schema.json`).then(
      (parsedSchema) => {
        configurationSchema = parsedSchema;
        done();
      },
    );
  });

  describe("consume()", () => {
    it("should decode data message: Uplink example for 01 data message with 2 active measurement channels", () => {
      const data = { data: { port: 1, payloadHex: "0100002e971253" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 94.27);
        assert.equal(value.data.deviceTemperature, -18.09);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a data message with the measuring range set by custom fields", () => {
      const data = {
        data: { port: 1, payloadHex: "0100002e971253" },
        device: {
          customFields: { temperatureRangeStart: 0, temperatureRangeEnd: 100 },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 94.27);
        assert.equal(value.data.deviceTemperature, -18.09);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode data message: Uplink example for 02 data message with 1 active measurement channels", () => {
      const data = { data: { port: 1, payloadHex: "0207001eb0" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 53.56);

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
      const data = { data: { port: 1, payloadHex: "031100000d73" } };

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
        assert.equal(value.data.value, 9.43);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode process alarm message: Uplink example for alert message high threshold with delay for channel temperature and high threshold for channel device temperature", () => {
      const data = { data: { port: 1, payloadHex: "030f00052ca80926b8" } };

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
        assert.equal(value.data.value, 89.32);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "deviceTemperature");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.lowThreshold, false);
        assert.equal(value.data.highThreshold, true);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);
        assert.equal(value.data.value, 34.12);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode technical message: Uplink example for alert message general instrument error", () => {
      const data = { data: { port: 1, payloadHex: "040000040001" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.alarmType, "STAT_DEV");
        assert.equal(value.data.causeOfFailure, "STAT_DEV_ERROR");

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode technical message: Uplink example for different channel alert", () => {
      const data = { data: { port: 1, payloadHex: "040300000001010002" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.alarmType, "MV_STAT channel 0");
        assert.equal(value.data.causeOfFailure, "MV_STAT_ERROR");

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "deviceTemperature");
        assert.equal(value.data.alarmType, "MV_STAT channel 1");
        assert.equal(value.data.causeOfFailure, "MV_STAT_WARNING");

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode radio unit message: Uplink example for Battery is low and RF duty-cycle limit was exceeded", () => {
      const data = { data: { port: 1, payloadHex: "050d0005" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.lowBattery, true);
        assert.equal(value.data.temperatureAlarm, false);
        assert.equal(value.data.dutyCycleAlarm, true);
        assert.equal(value.data.uartAlarm, false);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Radio unit identification message: Uplink example for metrology information message", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "07110f00001601c1a00000430c00000101c22000004270000001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productId, 15);
        assert.equal(value.data.productIdName, "NETRIS3");
        assert.equal(value.data.productSubId, 0);
        assert.equal(value.data.productSubIdName, "LoRaWAN");
        assert.equal(value.data.sensorDeviceTypeId, 22);
        assert.equal(value.data.temperatureMeasurand, 1);
        assert.equal(value.data.temperatureMeasurandName, "Temperature");
        assert.equal(value.data.temperatureMeasurementRangeStart, -20);
        assert.equal(value.data.temperatureMeasurementRangeEnd, 140);
        assert.equal(value.data.temperatureUnit, 1);
        assert.equal(value.data.temperatureUnitName, "°C");
        assert.equal(value.data.deviceTemperatureMeasurand, 1);
        assert.equal(value.data.deviceTemperatureMeasurandName, "Temperature");
        assert.equal(value.data.deviceTemperatureMeasurementRangeStart, -40);
        assert.equal(value.data.deviceTemperatureMeasurementRangeEnd, 60);
        assert.equal(value.data.deviceTemperatureUnit, 1);
        assert.equal(value.data.deviceTemperatureUnitName, "°C");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode keep-alive message: Uplink example for keep alive", () => {
      const data = { data: { port: 1, payloadHex: "081f00c781a1006ca4f8" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.numberOfMeasurements, 13074849);
        assert.equal(value.data.numberOfTransmissions, 7120120);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Extended identification message: Uplink example for extended radio unit & instrument identification", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "090a0f30303041313037373538392000bc614e00000001000000000800353e4e4e364555535832030106",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.optionalFieldsMask, 15);
        assert.equal(value.data.wikaSensorSerialNumber, "000A1077589 ");
        assert.equal(value.data.sensorLUID, 12345678);
        assert.equal(value.data.sensorHardwareVersion, "0.0.0");
        assert.equal(value.data.sensorFirmwareVersion, "0.0.8");
        assert.equal(value.data.deviceHardwareVersion, "1.0.0");
        assert.equal(value.data.deviceSerialNumber, "N013630");
        assert.equal(value.data.deviceProductCode, "N6EUSX2");
        assert.equal(value.data.deviceFirmwareVersion, "3.1.6");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode TULIP3 data message: data message with compact encoding for 2 channels", () => {
      const data = { data: { port: 1, payloadHex: "1001062e970e152f" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 94.27);
        assert.equal(value.data.deviceTemperature, -10.77);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 process alarm message: low threshold alarm of 2nd channel appears", () => {
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
        assert.equal(value.data.sensorCommunicationError, true);
        assert.equal(value.data.sensorALUSaturation, false);
        assert.equal(value.data.sensorMemoryIntegrity, false);
        assert.equal(value.data.sensorBusy, false);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 device alarm message: Channel alarms - minimum physical limit for channel 1 (temperature) and maximum physical limit for channel 2 (device temperature)", () => {
      const data = { data: { port: 1, payloadHex: "1303000010080020" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.outOfMinPhysicalSensorLimit, true);
        assert.equal(value.data.outOfMaxPhysicalSensorLimit, false);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "deviceTemperature");
        assert.equal(value.data.outOfMaxPhysicalSensorLimit, true);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
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

    it("should decode TULIP3 process alarm message: Multiple channels - no alarm on ch1, high threshold with delay on ch2", () => {
      const data = { data: { port: 1, payloadHex: "120100000804" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "temperature");
        assert.equal(value.data.lowThreshold, false);
        assert.equal(value.data.highThreshold, false);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "deviceTemperature");
        assert.equal(value.data.lowThreshold, false);
        assert.equal(value.data.highThreshold, false);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, true);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Read identification response with serial number", () => {
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

    it("should decode TULIP3 identification message: Write identification response - success", () => {
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

    it("should decode TULIP3 configuration message: Read configuration response - alarm settings part 1", () => {
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

    it("should decode TULIP3 configuration message: Write configuration response - not applied yet", () => {
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

    it("should decode TULIP3 spontaneous message: Generic downlink answer - success", () => {
      const data = { data: { port: 1, payloadHex: "1701010100" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.answeredDownlinkType, 1);
        assert.equal(value.data.answeredDownlinkSubType, 1);
        assert.equal(value.data.downlinkAnswerStatus, "Success");

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 spontaneous message: Fetch additional downlink", () => {
      const data = { data: { port: 1, payloadHex: "1702" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.fetchAdditionalDownlink, true);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode TULIP3 identification message: Full initial identification message", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "140100180304010103010402050118030f57494b4130303141424321",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productId, 3);
        assert.equal(value.data.productSubId, "LoRaWAN class C");
        assert.equal(value.data.channelPlan, 1);
        assert.equal(value.data.connectedSensorsSensor1, true);
        assert.equal(value.data.connectedSensorsSensor2, false);
        assert.equal(value.data.connectedSensorsSensor3, false);
        assert.equal(value.data.connectedSensorsSensor4, false);
        assert.equal(value.data.firmwareVersion, "3.1.4");
        assert.equal(value.data.hardwareVersion, "2.5.1");
        assert.equal(value.data.productionDate, "2024-03-15");
        assert.equal(value.data.serialNumberPart1, "WIKA0");
        assert.equal(value.data.serialNumberPart2, "01ABC!");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
