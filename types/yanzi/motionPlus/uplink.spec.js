

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yanzi Motion Plus Sensor Uplink", () => {
  let temperatureSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
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

  let lightSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/light.schema.json`).then((parsedSchema) => {
      lightSchema = parsedSchema;
      done();
    });
  });

  let occupancySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Yanzi Motion Plus Sensor Temperature payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleTemp",
              sampleTime: 1643364139738,
              value: 292.1,
            },
          ],
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 29.21);

        validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Humidity payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleHumidity",
              sampleTime: 1643364139747,
              value: 38.3,
            },
          ],
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 38.3);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Motion payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleMotion",
              sampleTime: 1643365120931,
              value: 7875,
              timeLastMotion: 1643365120931,
            },
          ],
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.motion, 7875);

        validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Yanzi Motion Plus Sensor Light payload", () => {
      const data = {
        data: {
          values: [
            {
              resourceType: "SampleIlluminance",
              sampleTime: 1643364139759,
              value: 88320,
              colorTemperature: 7518,
            },
          ],
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "light");
        assert.equal(value.data.light, 88.3);
        assert.equal(value.data.colorTemperature, 7518);

        validateSchema(value.data, lightSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
