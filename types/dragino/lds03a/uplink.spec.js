

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Dragino LDS03A Uplink", () => {
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

  let infoSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/info.schema.json`).then((parsedSchema) => {
      infoSchema = parsedSchema;
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

  let datalogSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/datalog.schema.json`)
      .then((parsedSchema) => {
        datalogSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Dragino LDS03A open uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0100000500000063bfe921",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarm, false);
        assert.equal(value.data.open, true);
        assert.equal(value.data.openDuration, 0);
        assert.equal(value.data.openCounts, 5);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Dragino LDS03A closed uplink", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0a011001ff0e65",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.685);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.firmwareVersion, "1.1.0");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
