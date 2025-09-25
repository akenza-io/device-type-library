

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO People Counter uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/battery_voltage.schema.json`)
      .then((parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      });
  });

  let temperatureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  let humiditySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  let leftToRightSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/left_to_right.schema.json`)
      .then((parsedSchema) => {
        leftToRightSchema = parsedSchema;
        done();
      });
  });

  let rightToLeftSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/right_to_left.schema.json`)
      .then((parsedSchema) => {
        rightToLeftSchema = parsedSchema;
        done();
      });
  });

  let sumLeftToRightSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/sum_left_to_right.schema.json`)
      .then((parsedSchema) => {
        sumLeftToRightSchema = parsedSchema;
        done();
      });
  });

  let sumRightToLeftSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/sum_right_to_left.schema.json`)
      .then((parsedSchema) => {
        sumRightToLeftSchema = parsedSchema;
        done();
      });
  });

  let differenceCountSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/difference_count.schema.json`)
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 5274);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 24.8);

        validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 22);

        validateSchema(value.data, humiditySchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "left_to_right");
        assert.equal(value.data.leftToRight, 8);

        validateSchema(value.data, leftToRightSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "right_to_left");
        assert.equal(value.data.rightToLeft, 10);

        validateSchema(value.data, rightToLeftSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "sum_left_to_right");
        assert.equal(value.data.sumLeftToRight, 38);

        validateSchema(value.data, sumLeftToRightSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "sum_right_to_left");
        assert.equal(value.data.sumRightToLeft, 77);

        validateSchema(value.data, sumRightToLeftSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "difference_count");
        assert.equal(value.data.differenceCount, -39);

        validateSchema(value.data, differenceCountSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
