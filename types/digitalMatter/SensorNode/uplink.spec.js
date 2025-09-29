

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digitalmatter sensor node Uplink", () => {
  let analogSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/analog.schema.json`).then((parsedSchema) => {
      analogSchema = parsedSchema;
      done();
    });
  });

  let digitalSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/digital.schema.json`)
      .then((parsedSchema) => {
        digitalSchema = parsedSchema;
        done();
      });
  });

  let gpsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gps.schema.json`).then((parsedSchema) => {
      gpsSchema = parsedSchema;
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

  let inputSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/input.schema.json`).then((parsedSchema) => {
      inputSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let measurementSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/measurement.schema.json`)
      .then((parsedSchema) => {
        measurementSchema = parsedSchema;
        done();
      });
  });

  let probeSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/probe.schema.json`).then((parsedSchema) => {
      probeSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Digitalmatter sensor node measurement payload", () => {
      const data = {
        data: {
          port: 130,
          payloadHex: "16706f6e6e7071283608",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.internalTemperature, 21.02);
        assert.equal(value.data.internalTemperatureF, 69.8);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "measurement");
        assert.equal(value.data.measurement3[0], 16);
        assert.equal(value.data.measurement3[1], 15.5);
        assert.equal(value.data.measurement3[2], 15);
        assert.equal(value.data.measurement3[3], 15);
        assert.equal(value.data.measurement3[4], 16);
        assert.equal(value.data.measurement3[5], 16.5);

        validateSchema(value.data, measurementSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Digitalmatter sensor node lifecycle payload ", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "40010206",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.firmwareMajor, 2);
        assert.equal(value.data.firmwareMinor, 6);
        assert.equal(value.data.hardwareRev, 1);
        assert.equal(value.data.product, 64);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
