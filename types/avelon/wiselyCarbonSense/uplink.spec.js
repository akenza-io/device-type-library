

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Avelon Carbonsense uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
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

  describe("consume()", () => {
    it("Should decode Avelon Carbonsense payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "fe265300e54202e0265200e54202e7265100e64202f1265000e64202f3265000e64202f7265000e64202f900",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 981.1);
        assert.equal(value.data.temperature, 22.9);
         assert.equal(value.data.temperatureF, 73.2);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 736);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 981);
        assert.equal(value.data.temperature, 22.9);
         assert.equal(value.data.temperatureF, 73.2);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 743);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.9);
        assert.equal(value.data.temperature, 23);
         assert.equal(value.data.temperatureF, 73.4);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 753);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.8);
        assert.equal(value.data.temperature, 23);
         assert.equal(value.data.temperatureF, 73.4);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 755);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.8);
        assert.equal(value.data.temperature, 23);
         assert.equal(value.data.temperatureF, 73.4);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 759);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.8);
        assert.equal(value.data.temperature, 23);
         assert.equal(value.data.temperatureF, 73.4);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 761);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
