import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Should decode the HKT People Counter Sensor uplinks", () => {
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

  let systemSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
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
    it("Should decode the HKT People Counter Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "686b74000001010203648601e1040105001e0600648300",
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

        assert.equal(value.topic, "system");
        assert.equal(value.data.hwVersion, 1);
        assert.equal(value.data.swVersion, 2);
        assert.equal(value.data.reportingPattern, "TIME_INTERVAL");
        assert.equal(value.data.infraredError, false);
        assert.equal(value.data.threshold, 100);

        validateSchema(value.data, systemSchema, { throwError: true });
      });

      consume(data);
    });

    it("Should decode the HKT People Counter Sensor counter uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400070700780096000000C8000000C8",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterA, 120);
        assert.equal(value.data.counterB, 150);
        assert.equal(value.data.absCountA, 200);
        assert.equal(value.data.absCountB, 200);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });
      consume(data);
    });

    it("Should decode the HKT People Counter Sensor installed uplinks", () => {
      const data = {
        data: {
          payloadHex: "686B7400098400",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.installed, false);

        validateSchema(value.data, systemSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
