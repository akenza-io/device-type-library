const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Wika Pew 1000 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let deviceAlarmSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/device_alarm.schema.json`)
      .then((parsedSchema) => {
        deviceAlarmSchema = parsedSchema;
        done();
      });
  });

  let deviceInformationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/device_information.schema.json`)
      .then((parsedSchema) => {
        deviceInformationSchema = parsedSchema;
        done();
      });
  });

  let errorSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/error.schema.json`)
      .then((parsedSchema) => {
        errorSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let processAlarmSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/process_alarm.schema.json`)
      .then((parsedSchema) => {
        processAlarmSchema = parsedSchema;
        done();
      });
  });

  let technicalAlarmSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/technical_alarm.schema.json`)
      .then((parsedSchema) => {
        technicalAlarmSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Wika Pew 1000 uplink without set customfields", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "01002309B91AF0",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.errorMessage, "Please define the customfields: pressureRangeStart, pressureRangeEnd, temperatureRangeStart, temperatureRangeEnd");

        utils.validateSchema(value.data, errorSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 standard uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "01002309B91AF0",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.5);
        assert.equal(value.data.deviceTemperature, 3.96);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, -0.011);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 process alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "03000119B4",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "process_alarm");
        assert.equal(value.data.alarmChannel, "PRESSURE");
        assert.equal(value.data.alarmStatus, "TRIGGERED");
        assert.equal(value.data.alarmType, "HIGH_THRESHOLD");
        assert.equal(value.data.value, 4.08);

        utils.validateSchema(value.data, processAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 technical alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "040010",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "technical_alarm");
        assert.equal(value.data.alarmStatus, "TRIGGERED");
        assert.deepEqual(value.data.alarmType, ["SENSOR_COMMUNICATION_ERROR"]);

        utils.validateSchema(value.data, technicalAlarmSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Wika Pew 1000 device alarm uplink", () => {
      const data = {
        device: {
          customFields: {
            pressureRangeStart: 0,
            pressureRangeEnd: 10,
            temperatureRangeStart: -40,
            temperatureRangeEnd: 60
          }
        },
        data: {
          port: 1,
          payloadHex:
            "0500001C",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "device_alarm");
        assert.equal(value.data.alarmStatus, "TRIGGERED");
        assert.deepEqual(value.data.alarmType, "LOW_BATTERY");
        assert.deepEqual(value.data.causeOfFailure, "GENERIC");
        assert.deepEqual(value.data.value, 2.8);

        utils.validateSchema(value.data, deviceAlarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
