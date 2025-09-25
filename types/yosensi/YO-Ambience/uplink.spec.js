

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO Ambience uplink", () => {
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

  let internalTemperatureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/internal_temperature.schema.json`)
      .then((parsedSchema) => {
        internalTemperatureSchema = parsedSchema;
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

  let co2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/co2.schema.json`).then((parsedSchema) => {
      co2Schema = parsedSchema;
      done();
    });
  });

  let illuminanceSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/illuminance.schema.json`)
      .then((parsedSchema) => {
        illuminanceSchema = parsedSchema;
        done();
      });
  });

  let presenceCounterSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/presence_counter.schema.json`)
      .then((parsedSchema) => {
        presenceCounterSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Ambience payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "02460000080001115c0d000100c0100000256c0001028c1a0001000b6000010003",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4444);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 19.2);

        validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 37);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 652);

        validateSchema(value.data, co2Schema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "illuminance");
        assert.equal(value.data.illuminance, 0.11);

        validateSchema(value.data, illuminanceSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "presence_counter");
        assert.equal(value.data.presenceCounter, 3);

        validateSchema(value.data, presenceCounterSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
