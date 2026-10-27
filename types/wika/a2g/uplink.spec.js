import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("WIKA A2G-520 Uplink", () => {
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

  describe("consume()", () => {
    it("should decode data message: Uplink example for 01 data message with 2 active measurement channels", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010042dc6666442286660000000000000000000000000000000001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, 110.2);
        assert.equal(value.data.flow, 650.1);
        assert.equal(value.data.input1, 0);
        assert.equal(value.data.input2, 0);
        assert.equal(value.data.input3, 0);
        assert.equal(value.data.input4, 0);
        assert.equal(value.data.relayStatus1, 1);
        assert.equal(value.data.relayStatus2, 0);

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

    it("should decode technical message: Uplink example for 04 data message", () => {
      const data = { data: { port: 1, payloadHex: "04000f" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.pressureSignalOverload, true);
        assert.equal(value.data.analogOutput1SignalOverload, true);
        assert.equal(value.data.analogOutput2SignalOverload, true);
        assert.equal(value.data.modbusCommunicationError, true);
        assert.equal(value.data.voltageInput1SignalOverload, false);
        assert.equal(value.data.voltageInput2SignalOverload, false);
        assert.equal(value.data.temperatureInput3SignalOverload, false);
        assert.equal(value.data.temperatureInput4SignalOverload, false);

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode radio unit message: Uplink example for 05 data message", () => {
      const data = { data: { port: 1, payloadHex: "050d0102" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.adcConverterError, false);
        assert.equal(value.data.pressureSensorNoResponseError, false);
        assert.equal(value.data.pressureSensorTimeoutError, false);
        assert.equal(value.data.factoryOptionsWriteError, false);
        assert.equal(value.data.factoryOptionsDeleteError, false);
        assert.equal(value.data.invalidFactoryOptionsError, false);
        assert.equal(value.data.userSettingsInvalidError, false);
        assert.equal(value.data.userSettingsReadWriteError, true);
        assert.equal(value.data.zeroOffsetOverRangeError, false);
        assert.equal(value.data.invalidSignalSourceSpecifiedError, false);
        assert.equal(value.data.analogOutput2OverTemperatureError, false);
        assert.equal(value.data.analogOutput2LoadFaultError, false);
        assert.equal(value.data.analogOutput2OverRangeError, false);
        assert.equal(value.data.analogOutput1OverTemperatureError, false);
        assert.equal(value.data.analogOutput1LoadFaultError, true);
        assert.equal(value.data.analogOutput1OverRangeError, false);

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Radio unit identification message: Uplink example for metrology information message", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "07660d0012030a8237313030455758360000000000000000c51c4000451c4000010b0214282e",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productId, 13);
        assert.equal(value.data.productIdName, "A2G");
        assert.equal(value.data.productSubId, 0);
        assert.equal(value.data.productSubIdName, "LoRaWAN");
        assert.equal(value.data.sensorFirmwareVersion, "1.2.3");
        assert.equal(value.data.sensorHardwareVersion, "10");
        assert.equal(value.data.hardwareAssemblyTypeId, 130);
        assert.equal(value.data.hardwareAssemblyTypeName, "A2G LC3 BAT");
        assert.equal(value.data.serialNumber, "7100EWX6");
        assert.equal(value.data.channel0Measurand, 3);
        assert.equal(value.data.channel0MeasurandName, "Pressure (gauge)");
        assert.equal(value.data.channel0MeasurementRangeStart, -2500);
        assert.equal(value.data.channel0MeasurementRangeEnd, 2500);
        assert.equal(value.data.channel0Unit, 1);
        assert.equal(value.data.channel0UnitName, "Pa");
        assert.equal(value.data.channel1Measurand, 6);
        assert.equal(value.data.channel1MeasurandName, "Flow (vol.)");
        assert.equal(value.data.channel1Unit, 11);
        assert.equal(
          value.data.channel1UnitName,
          "[m³/h] cubic metre per hour (cbm/h)",
        );
        assert.equal(value.data.channel2Measurand, 70);
        assert.equal(value.data.channel2MeasurandName, "Input 1");
        assert.equal(value.data.channel2Unit, 2);
        assert.equal(value.data.channel2UnitName, "kPa");
        assert.equal(value.data.channel3Measurand, 71);
        assert.equal(value.data.channel3MeasurandName, "Input 2");
        assert.equal(value.data.channel3Unit, 20);
        assert.equal(value.data.channel3UnitName, "% rH");
        assert.equal(value.data.channel4Measurand, 72);
        assert.equal(value.data.channel4MeasurandName, "Input 3");
        assert.equal(value.data.channel4Unit, 40);
        assert.equal(value.data.channel4UnitName, "°C");
        assert.equal(value.data.channel5Measurand, 73);
        assert.equal(value.data.channel5MeasurandName, "Input 4");
        assert.equal(value.data.channel5Unit, 46);
        assert.equal(value.data.channel5UnitName, "bin");

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode keep-alive message: Uplink example for keep alive", () => {
      const data = { data: { port: 1, payloadHex: "0821c9" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevelNewEvent, true);
        assert.equal(value.data.batteryLevel, 73);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
