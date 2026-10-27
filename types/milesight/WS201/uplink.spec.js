import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

describe("WS201 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403823E0004D645",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.distance, 62);
        assert.equal(value.data.remaining, 69);

        validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryLevel, 100);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
