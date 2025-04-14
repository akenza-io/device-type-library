const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Airflow Pro uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/battery_voltage.schema.json`)
      .then((parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      });
  });

  let internalTemperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/internal_temperature.schema.json`)
      .then((parsedSchema) => {
        internalTemperatureSchema = parsedSchema;
        done();
      });
  });

  let humiditySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  let differentialPressureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/differential_pressure.schema.json`)
      .then((parsedSchema) => {
        differentialPressureSchema = parsedSchema;
        done();
      });
  });

  let velocitySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/velocity.schema.json`)
      .then((parsedSchema) => {
        velocitySchema = parsedSchema;
        done();
      });
  });

  let gasTemperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/gas_temperature.schema.json`)
      .then((parsedSchema) => {
        gasTemperatureSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Airflow Pro payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0205000008000112600d0001005e1000002c15000100650d001125006aa20001016a",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4704);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 9.4);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 44);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "differential_pressure");
        assert.equal(value.data.differentialPressure, 10.1);

        utils.validateSchema(value.data, differentialPressureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gas_temperature");
        assert.equal(value.data.gasTemperature, 10.6);

        utils.validateSchema(value.data, gasTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "velocity");
        assert.equal(value.data.velocity, 3.62);

        utils.validateSchema(value.data, velocitySchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
