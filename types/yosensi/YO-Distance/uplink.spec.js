const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO Distance uplink", () => {
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

  let accelerometerSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/accelerometer.schema.json`)
      .then((parsedSchema) => {
        accelerometerSchema = parsedSchema;
        done();
      });
  });

  let distanceSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/distance.schema.json`)
      .then((parsedSchema) => {
        distanceSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Distance (with accelerometer) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "0200000008000112880d000100cd10000063280001012e4100050012ffe805fc",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4744);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 20.5);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 99);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "distance");
        assert.equal(value.data.distance, 302);

        utils.validateSchema(value.data, distanceSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "accelerometer");
        assert.equal(value.data.accelerometerX, 1.8);
        assert.equal(value.data.accelerometerY, -2.4);
        assert.equal(value.data.accelerometerZ, 153.2);

        utils.validateSchema(value.data, accelerometerSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Distance (without accelerometer) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "0228000008000112c40d000100e41000001d2800010159",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4804);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 22.8);

        utils.validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 29);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "distance");
        assert.equal(value.data.distance, 345);

        utils.validateSchema(value.data, distanceSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
