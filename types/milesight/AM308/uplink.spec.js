
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

describe("AM308 Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the AM319 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0367EE0004687C05000106CB02077DA803087D25000973",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.co2, 936);
        assert.equal(value.data.humidity, 62);
        assert.equal(value.data.light, 2);
        assert.equal(value.data.pir, "TRIGGER");
        assert.equal(value.data.pressure, 0);
        assert.equal(value.data.temperature, 23.8);
        assert.equal(value.data.tvoc, 37);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
