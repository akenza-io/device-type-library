const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Temp uplink", () => {
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

  let externalTemperature1Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/external_temperature1.schema.json`)
      .then((parsedSchema) => {
        externalTemperature1Schema = parsedSchema;
        done();
      });
  });

  let externalTemperature2Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/external_temperature2.schema.json`)
      .then((parsedSchema) => {
        externalTemperature2Schema = parsedSchema;
        done();
      });
  });

  let externalTemperature3Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/external_temperature3.schema.json`)
      .then((parsedSchema) => {
        externalTemperature3Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Temp payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0200000008000111880d000100f7100000380d00110000ea0d00110100db0d00110200d6",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4488);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 24.7);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 56);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external_temperature1");
        assert.equal(value.data.externalTemperature1, 23.4);

        utils.validateSchema(value.data, externalTemperature1Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external_temperature2");
        assert.equal(value.data.externalTemperature2, 21.9);

        utils.validateSchema(value.data, externalTemperature2Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external_temperature3");
        assert.equal(value.data.externalTemperature3, 21.4);

        utils.validateSchema(value.data, externalTemperature3Schema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
