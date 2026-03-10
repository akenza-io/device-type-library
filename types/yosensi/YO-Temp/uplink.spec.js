

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO Temp uplink", () => {
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

  let externalTemperature1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/external_temperature_1.schema.json`)
      .then((parsedSchema) => {
        externalTemperature1Schema = parsedSchema;
        done();
      });
  });

  let externalTemperature2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/external_temperature_2.schema.json`)
      .then((parsedSchema) => {
        externalTemperature2Schema = parsedSchema;
        done();
      });
  });

  let externalTemperature3Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/external_temperature_3.schema.json`)
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4488);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 24.7);

        validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 56);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external_temperature_1");
        assert.equal(value.data.externalTemperature1, 23.4);

        validateSchema(value.data, externalTemperature1Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external_temperature_2");
        assert.equal(value.data.externalTemperature2, 21.9);

        validateSchema(value.data, externalTemperature2Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "external_temperature_3");
        assert.equal(value.data.externalTemperature3, 21.4);

        validateSchema(value.data, externalTemperature3Schema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
