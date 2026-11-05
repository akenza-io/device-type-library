import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Sensative Strips MS Comfort Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode a temperature only payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0001020105",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, { historySeqNr: 1, prevHistSeqNr: 1 });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, { temperature: 26.1 });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a payload with battery, humidity, temperature and light", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "00020164505a00d2070190",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, {
          batteryLevel: 100,
          historySeqNr: 2,
          prevHistSeqNr: 2,
        });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, {
          temperature: 21,
          humidity: 45,
          light: 400,
        });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
