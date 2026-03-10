

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Alevel V2 Uplink", () => {
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
    it("should decode the Alevel V2 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "81AFFBD1E158",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.sequenceNumber, 175);
        assert.equal(value.data.batteryStatus, "HEALTHY");
        assert.equal(value.data.currentProfile, "IMR_LORA_SIGFOX");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, -5);
        assert.equal(value.data.buttonLatched, false);
        assert.equal(value.data.isButtonPressed, true);
        assert.equal(value.data.currentLevel, 90.1);
        assert.equal(value.data.removedFromDial, false);
        assert.equal(value.data.isRefilling, true);
        assert.equal(value.data.highLPG, true);
        assert.equal(value.data.lowLPG, false);
        assert.equal(value.data.outOfRange, false);
        assert.equal(value.data.notValidReadout, false);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
