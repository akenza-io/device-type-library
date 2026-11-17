import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Sensative Strips MS Drip Uplink", () => {
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

  let alarmSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
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
    it("should decode a flood report with alarm and temperature", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "00020d320e01020105",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "alarm");
        assert.deepEqual(value.data, { floodAlarm: true });

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, { temperature: 26.1, flood: 50 });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a battery report", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0003015f0d00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.deepEqual(value.data, { batteryLevel: 95 });

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.deepEqual(value.data, { flood: 0 });

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
