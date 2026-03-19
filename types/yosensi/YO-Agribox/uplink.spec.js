

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO AgriBox uplink", () => {
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

  let outputVoltageCh1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/output_voltage_ch1.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCh1Schema = parsedSchema;
        done();
      });
  });

  let outputVoltageCh2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/output_voltage_ch2.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCh2Schema = parsedSchema;
        done();
      });
  });

  let outputVoltageCh3Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/output_voltage_ch3.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCh3Schema = parsedSchema;
        done();
      });
  });

  let outputVoltageCh4Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/output_voltage_ch4.schema.json`)
      .then((parsedSchema) => {
        outputVoltageCh4Schema = parsedSchema;
        done();
      });
  });

  let soilMoisture1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/soil_moisture_1.schema.json`)
      .then((parsedSchema) => {
        soilMoisture1Schema = parsedSchema;
        done();
      });
  });

  let soilMoisture2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/soil_moisture_2.schema.json`)
      .then((parsedSchema) => {
        soilMoisture2Schema = parsedSchema;
        done();
      });
  });

  let soilMoisture3Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/soil_moisture_3.schema.json`)
      .then((parsedSchema) => {
        soilMoisture3Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO AgriBox payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "021b0000080001129c0d000100e41000001d440007000800030002000066001100018a660011010187660011020187",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 4764);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "internal_temperature");
        assert.equal(value.data.internalTemperature, 22.8);

        validateSchema(value.data, internalTemperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 29);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_voltage_ch1");
        assert.equal(value.data.outputVoltageCh1, 8);

        validateSchema(value.data, outputVoltageCh1Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_voltage_ch2");
        assert.equal(value.data.outputVoltageCh2, 3);

        validateSchema(value.data, outputVoltageCh2Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_voltage_ch3");
        assert.equal(value.data.outputVoltageCh3, 2);

        validateSchema(value.data, outputVoltageCh3Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_voltage_ch4");
        assert.equal(value.data.outputVoltageCh4, 0);

        validateSchema(value.data, outputVoltageCh4Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "soil_moisture_1");
        assert.equal(value.data.soilMoisture1, 3.94);

        validateSchema(value.data, soilMoisture1Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "soil_moisture_2");
        assert.equal(value.data.soilMoisture2, 3.91);

        validateSchema(value.data, soilMoisture2Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "soil_moisture_3");
        assert.equal(value.data.soilMoisture3, 3.91);

        validateSchema(value.data, soilMoisture3Schema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
