import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Transmitter 600-232", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the 600-232 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000BD0C0A1200CE00CA00000000",
        },
      };

      // --- Lifecycle
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 189);
        assert.equal(value.data.type, 12);
        assert.equal(value.data.seqCounter, 10);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default (temperatures values)
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.closeTo(value.data.temperature1, 20.6, 0.1);
        assert.closeTo(value.data.temperature2, 20.2, 0.1);
        assert.closeTo(value.data.temperature1F, 69.1, 0.1);
        assert.closeTo(value.data.temperature2F, 68.4, 0.1);
        assert.equal(value.data.msgType, "NORMAL");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm (Temp1 High triggered)
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperature1Low, false);
        assert.equal(value.data.temperature1High, false);
        assert.equal(value.data.temperature2Low, false);
        assert.equal(value.data.temperature2High, false);

        validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
