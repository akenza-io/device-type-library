import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

describe("Globalsat LT-20 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Globalsat LT-20 payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "80023032525AEFD2046400",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryLevel, 100);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.longitude, 115.8162);
        assert.equal(value.data.latitude, -31.8965256);
        assert.equal(value.data.gpsFix, "Not fix");
        assert.equal(value.data.reportType, "Motion mode static report");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
      done();
    });
  });
});
