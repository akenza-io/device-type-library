

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("LSN50 V2 D23 Uplink", () => {
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

  let dsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/ds.schema.json`).then((parsedSchema) => {
      dsSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the LSN50 V2 D23 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0e41008200000c0034fffd",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");

        assert.equal(value.data.c0adc, 0);
        assert.equal(value.data.digitalStatus, "LOW");
        assert.equal(value.data.extTrigger, false);
        assert.equal(value.data.open, false);
        assert.equal(value.data.temperature, 13);
        assert.equal(value.data.temperatureF, 55.4);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "ds");

        assert.equal(value.data.c2temperature, 5.2);
        assert.equal(value.data.c2temperatureF, 41.4);
        assert.equal(value.data.c3temperature, -0.3);
        assert.equal(value.data.c3temperatureF, 31.5);

        validateSchema(value.data, dsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.649);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
