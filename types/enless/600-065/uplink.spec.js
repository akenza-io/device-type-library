
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";






describe("Transmitter 600-065", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
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
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.windowCount, 7);
        assert.equal(data.windowOpened, false);
        assert.equal(data.rbe, false);
        assert.equal(data.msgType, "NORMAL");
      });

      consume(data);
    });
  });
});
