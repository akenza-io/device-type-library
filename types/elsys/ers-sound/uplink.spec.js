

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Elsys Sound uplink", () => {
  let soundSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/sound.schema.json`).then((parsedSchema) => {
      soundSchema = parsedSchema;
      done();
    });
  });

  let noiseSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/noise.schema.json`)
      .then((parsedSchema) => {
        noiseSchema = parsedSchema;
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

  let defaultSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Elsys Sound payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100ee02230400bd070df615402c",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.light, 189);
        assert.equal(value.data.humidity, 35);
        assert.equal(value.data.temperature, 23.8);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.574);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "sound");
        assert.equal(value.data.soundPeak, 64);
        assert.equal(value.data.soundAvg, 44);

        validateSchema(value.data, soundSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "noise");
        assert.equal(value.data.soundPeak, 64);
        assert.equal(value.data.soundAvg, 44);

        validateSchema(value.data, noiseSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
