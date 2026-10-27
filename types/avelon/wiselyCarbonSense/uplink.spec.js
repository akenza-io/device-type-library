import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";

describe("Avelon Carbonsense uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode Avelon Carbonsense payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "fe265300e54202e0265200e54202e7265100e64202f1265000e64202f3265000e64202f7265000e64202f900",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 981.1);
        assert.equal(value.data.temperature, 22.9);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 736);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 981);
        assert.equal(value.data.temperature, 22.9);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 743);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.9);
        assert.equal(value.data.temperature, 23);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 753);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.8);
        assert.equal(value.data.temperature, 23);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 755);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.8);
        assert.equal(value.data.temperature, 23);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 759);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.pressure, 980.8);
        assert.equal(value.data.temperature, 23);
        assert.equal(value.data.humidity, 33);
        assert.equal(value.data.co2, 761);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
