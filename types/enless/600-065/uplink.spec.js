
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Transmitter 600-065", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
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

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the 600-065 periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "000037260302000000000000000000000007000000000000000000000000",
        },
      };

      // --- Lifecycle ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 55);
        assert.equal(value.data.type, 38);
        assert.equal(value.data.seqCounter, 3);
        assert.equal(value.data.fwVersion, 2);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 10

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default ---
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");

        assert.equal(value.data.windowCount, 7);
        assert.equal(value.data.windowOpened, false);
        assert.equal(value.data.rbe, false);
        assert.equal(value.data.msgType, "NORMAL");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
