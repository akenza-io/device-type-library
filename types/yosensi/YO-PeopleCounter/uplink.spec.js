const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Yosensi YO People Counter uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/batteryVoltage.schema.json`)
      .then((parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      });
  });

  let temperatureSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
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

  let leftToRightSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/leftToRight.schema.json`)
      .then((parsedSchema) => {
        leftToRightSchema = parsedSchema;
        done();
      });
  });

  let rightToLeftSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/rightToLeft.schema.json`)
      .then((parsedSchema) => {
        rightToLeftSchema = parsedSchema;
        done();
      });
  });

  let sumLeftToRightSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/sumLeftToRight.schema.json`)
      .then((parsedSchema) => {
        sumLeftToRightSchema = parsedSchema;
        done();
      });
  });

  let sumRightToLeftSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/sumRightToLeft.schema.json`)
      .then((parsedSchema) => {
        sumRightToLeftSchema = parsedSchema;
        done();
      });
  });

  let differenceCountSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/differenceCount.schema.json`)
      .then((parsedSchema) => {
        differenceCountSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO People Counter (Battery Voltage, Temperature, Humidity) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "026a0001080001149a0d000100f810000016",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "batteryVoltage");
        assert.equal(value.data.batteryVoltage, 5274);

        utils.validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 24.8);

        utils.validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 22);

        utils.validateSchema(value.data, humiditySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yosensi YO People Counter (Counters, Sum of Counts, Difference between sum) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "026b003d60001100000860001101000a6000130200000026600013030000004d60001304ffffffd9",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "leftToRight");
        assert.equal(value.data.leftToRight, 8);

        utils.validateSchema(value.data, leftToRightSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "rightToLeft");
        assert.equal(value.data.rightToLeft, 10);

        utils.validateSchema(value.data, rightToLeftSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "sumLeftToRight");
        assert.equal(value.data.sumLeftToRight, 38);

        utils.validateSchema(value.data, sumLeftToRightSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "sumRightToLeft");
        assert.equal(value.data.sumRightToLeft, 77);

        utils.validateSchema(value.data, sumRightToLeftSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "differenceCount");
        assert.equal(value.data.differenceCount, -39);

        utils.validateSchema(value.data, differenceCountSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
