

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Sensative presence Uplink", () => {
  let lifecycleSchema = null;
  let alarmSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
    loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff6e02378c8448000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.badConditionsCounter, 0);
        assert.equal(value.data.stackTxFailRebootCount, 0);
        assert.equal(value.data.startUpCount, 72);
        assert.equal(value.data.softwareVersion, "2378c84");
        assert.equal(value.data.watchdogCount, 0);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff015b0a00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 91);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.doorAlarm, false);

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the sensative presence payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ffff015b0a01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 91);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.doorAlarm, true);

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
