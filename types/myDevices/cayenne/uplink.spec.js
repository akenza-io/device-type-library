

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Cayenne uplink", () => {
  let accelerometerSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/accelerometer.schema.json`)
      .then((parsedSchema) => {
        accelerometerSchema = parsedSchema;
        done();
      });
  });

  let analogSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/analog.schema.json`).then((parsedSchema) => {
      analogSchema = parsedSchema;
      done();
    });
  });

  let barometerSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/barometer.schema.json`)
      .then((parsedSchema) => {
        barometerSchema = parsedSchema;
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

  let gyrometerSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gyrometer.schema.json`)
      .then((parsedSchema) => {
        gyrometerSchema = parsedSchema;
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

  let lightSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/light.schema.json`).then((parsedSchema) => {
      lightSchema = parsedSchema;
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

  let presenceSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/presence.schema.json`)
      .then((parsedSchema) => {
        presenceSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Cayenne Temperature payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03670110056700FF",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.channel, 3);
        assert.equal(value.data.temperature, 27.2);
        assert.equal(value.data.temperatureF, 81);

        validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.channel, 5);
        assert.equal(value.data.temperature, 25.5);
        assert.equal(value.data.temperatureF, 77.9);

        validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Cayenne Accelerometer payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "067104D2FB2E0000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "accelerometer");
        assert.equal(value.data.channel, 6);
        assert.equal(value.data.accX, 1.234);
        assert.equal(value.data.accY, -1.234);
        assert.equal(value.data.accZ, 0);

        validateSchema(value.data, accelerometerSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Cayenne GPS payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "018806765ff2960a0003e8",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "gps");
        assert.equal(value.data.channel, 1);
        assert.equal(value.data.latitude, 42.3519);
        assert.equal(value.data.longitude, -87.9094);
        assert.equal(value.data.altitude, 10);

        validateSchema(value.data, gpsSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
