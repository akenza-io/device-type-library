

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO Airflow Pro Dual uplink", () => {
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

  let differentialPressure1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/differential_pressure_1.schema.json`)
      .then((parsedSchema) => {
        differentialPressure1Schema = parsedSchema;
        done();
      });
  });

  let differentialPressure2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/differential_pressure_2.schema.json`)
      .then((parsedSchema) => {
        differentialPressure2Schema = parsedSchema;
        done();
      });
  });

  let gasTemperature1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/gas_temperature_1.schema.json`)
      .then((parsedSchema) => {
        gasTemperature1Schema = parsedSchema;
        done();
      });
  });

  let gasTemperature2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/gas_temperature_2.schema.json`)
      .then((parsedSchema) => {
        gasTemperature2Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Airflow Pro Dual payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "022e000008000112cc0d000100e51000001815000100000d00112500e61500110100000d00112600e5",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4812);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 22.9);

        validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 24);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "differential_pressure_1");
        assert.equal(value.data.differentialPressure1, 0);

        validateSchema(value.data, differentialPressure1Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "differential_pressure_2");
        assert.equal(value.data.differentialPressure2, 0);

        validateSchema(value.data, differentialPressure2Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gas_temperature_1");
        assert.equal(value.data.gasTemperature1, 23);

        validateSchema(value.data, gasTemperature1Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gas_temperature_2");
        assert.equal(value.data.gasTemperature2, 22.9);

        validateSchema(value.data, gasTemperature2Schema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
