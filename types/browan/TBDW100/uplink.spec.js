

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("TBDW100 uplink", () => {
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

  let doorCountSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/door_count.schema.json`)
      .then((parsedSchema) => {
        doorCountSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("Should decode TBDW100 payload", () => {
      const data = {
        state: {},
        data: {
          payloadHex: "017b345cb1510c00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value.lastCount, 3153);
        assert.isNotNull(value.partialUsage, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.open, true);
        assert.equal(value.data.temperature, 20);
        assert.equal(value.data.time, 45404);
        assert.equal(value.data.relativeCount, 0);
        assert.equal(value.data.count, 3153);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode TBDW100 payload", () => {
      const data = {
        state: { lastCount: 3053, partialUsage: 0 },
        data: {
          payloadHex: "017b345cb1510c00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastCount, 3153);
        assert.equal(value.partialUsage, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 50);
        assert.equal(value.data.usageCount, 25);

        validateSchema(value.data, doorCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.6);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.open, true);
        assert.equal(value.data.temperature, 20);
        assert.equal(value.data.time, 45404);
        assert.equal(value.data.relativeCount, 100);
        assert.equal(value.data.count, 3153);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
