import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("WIKA GD-20-W Uplink", () => {
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

  let errorSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`).then((parsedSchema) => {
      errorSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode data message with channels 1,2 and 5 and no ongoing alarm", () => {
      const data = { data: { port: 1, payloadHex: "0104001254012135041754" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.channel0, 2.63);
        assert.equal(value.data.channel1, 6.188);
        assert.equal(value.data.channel4, 5.468);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a data message with the measuring range set by custom fields", () => {
      const data = {
        data: { port: 1, payloadHex: "0104001254012135041754" },
        device: {
          customFields: { channel0RangeStart: 0, channel0RangeEnd: 100 },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.channel0, 21.92);
        assert.equal(value.data.channel1, 6.188);
        assert.equal(value.data.channel4, 5.468);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode process alarm message for channel 0 with high threshold alarm", () => {
      const data = { data: { port: 1, payloadHex: "0307000009bf" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.channel, "channel0");
        assert.equal(value.data.alarmStatus, "triggered");
        assert.equal(value.data.lowThreshold, true);
        assert.equal(value.data.highThreshold, false);
        assert.equal(value.data.fallingSlope, false);
        assert.equal(value.data.risingSlope, false);
        assert.equal(value.data.lowThresholdWithDelay, false);
        assert.equal(value.data.highThresholdWithDelay, false);
        assert.equal(value.data.value, -0.006);

        validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode sensor technical alarm message for channel 0 with alarmtype 0400", () => {
      const data = { data: { port: 1, payloadHex: "0405000400" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.channel, "channel0");
        assert.equal(
          value.data.alarmType,
          "recurring modbus communication error",
        );

        validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Device alarm message with battery low alarm triggered", () => {
      const data = { data: { port: 1, payloadHex: "05020001" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.alarmType, "low battery");

        validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Configuration status message with main configuration", () => {
      const data = {
        data: { port: 1, payloadHex: "060120040000003c00050000003c000100" },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.configurationId, 1);
        assert.equal(value.data.status, 2);
        assert.equal(value.data.statusDescription, "configuration successful");
        assert.equal(value.data.commandType, 4);
        assert.equal(value.data.acquisitionTimeAlarmsOff, 60);
        assert.equal(value.data.publicationTimeFactorAlarmsOff, 5);
        assert.equal(value.data.acquisitionTimeAlarmsOn, 60);
        assert.equal(value.data.publicationTimeFactorAlarmsOn, 1);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Device identification message", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "070015400200010050484f454e49585f4642000407030a0101176e040c03076400000000000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.productId, 21);
        assert.equal(value.data.productSubId, 64);
        assert.equal(value.data.wirelessModuleFirmwareVersion, "0.2.0");
        assert.equal(value.data.wirelessModuleHardwareVersion, "0.1.0");
        assert.equal(value.data.serialNumber, "PHOENIX_FB");
        assert.equal(value.data.channel0MeasurandId, 4);
        assert.equal(value.data.channel0Measurand, "Pressure absolute");
        assert.equal(value.data.channel0UnitId, 7);
        assert.equal(value.data.channel0Unit, "bar");
        assert.equal(value.data.channel1MeasurandId, 3);
        assert.equal(value.data.channel1Measurand, "Pressure gauge");
        assert.equal(value.data.channel1UnitId, 10);
        assert.equal(value.data.channel1Unit, "Pa");
        assert.equal(value.data.channel2MeasurandId, 1);
        assert.equal(value.data.channel2Measurand, "Temperature");
        assert.equal(value.data.channel2UnitId, 1);
        assert.equal(value.data.channel2Unit, "°C");
        assert.equal(value.data.channel3MeasurandId, 23);
        assert.equal(value.data.channel3Measurand, "Density");
        assert.equal(value.data.channel3UnitId, 110);
        assert.equal(value.data.channel3Unit, "kg/m³");
        assert.equal(value.data.channel4MeasurandId, 4);
        assert.equal(value.data.channel4Measurand, "Pressure absolute");
        assert.equal(value.data.channel4UnitId, 12);
        assert.equal(value.data.channel4Unit, "kPa");
        assert.equal(value.data.channel5MeasurandId, 3);
        assert.equal(value.data.channel5Measurand, "Pressure gauge");
        assert.equal(value.data.channel5UnitId, 7);
        assert.equal(value.data.channel5Unit, "bar");
        assert.equal(value.data.gasMixturesSF6, 100);
        assert.equal(value.data.gasMixturesN2, 0);
        assert.equal(value.data.gasMixturesCF4, 0);
        assert.equal(value.data.gasMixturesO2, 0);
        assert.equal(value.data.gasMixturesC02, 0);
        assert.equal(value.data.gasMixturesNovec4710, 0);
        assert.equal(value.data.gasMixturesHe, 0);
        assert.equal(value.data.gasMixturesAr, 0);

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Keep alive message with restart event and 99% battery estimation", () => {
      const data = { data: { port: 1, payloadHex: "080063" } };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.restartedSinceLastKeepAlive, false);
        assert.equal(value.data.batteryLevel, 99);
        assert.equal(value.data.batteryLevelCalculationError, false);
        assert.equal(value.data.batteryPresent, true);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Extended device identification message with measuring ranges", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "090000000000414000000000000048435000c220000042a0000000000000412000000000000043480000bf8000003f800000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "device_information");
        assert.equal(value.data.channel0Min, 0);
        assert.equal(value.data.channel0Max, 12);
        assert.equal(value.data.channel1Min, 0);
        assert.equal(value.data.channel1Max, 200000);
        assert.equal(value.data.channel2Min, -40);
        assert.equal(value.data.channel2Max, 80);
        assert.equal(value.data.channel3Min, 0);
        assert.equal(value.data.channel3Max, 10);
        assert.equal(value.data.channel4Min, 0);
        assert.equal(value.data.channel4Max, 200);
        assert.equal(value.data.channel5Min, -1);
        assert.equal(value.data.channel5Max, 1);

        validateSchema(value.data, deviceInformationSchema, {
          throwError: true,
        });
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
