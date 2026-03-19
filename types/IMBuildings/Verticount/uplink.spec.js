

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("IMBuilding Verticount counter", () => {
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

  let totalCounterSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/total_counter.schema.json`)
      .then((parsedSchema) => {
        totalCounterSchema = parsedSchema;
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
    it("should decode the IMBuilding Verticount standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "02060004a30b0114930d00016f00000000000000000002",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterA, 0);
        assert.equal(value.data.counterB, 0);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "total_counter");
        assert.equal(value.data.totalCounterA, 0);
        assert.equal(value.data.totalCounterB, 0);

        validateSchema(value.data, totalCounterSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.deviceStatus, 0);
        assert.equal(value.data.payloadCounter, 2);
        assert.equal(value.data.sensorStatus, 0);
        assert.equal(value.data.batteryVoltage, 3.67);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
