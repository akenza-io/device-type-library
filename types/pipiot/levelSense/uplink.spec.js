import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

describe("Pipiot levelSense uplink", () => {
  let extSchema = null;
  let consume = null;
  let defaultSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    extSchema = loadSchema(`${import.meta.dirname}/ext.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Pipiot levelSense payload", () => {
      const data = {
        data: {
          payloadHex: "3000001060d701d219049d02",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.ultrasonicDistanceExt, 838);
        assert.equal(value.data.laserDistanceExt, 43);

        validateSchema(value.data, extSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.laserReflectance, 119296);
        assert.equal(value.data.temperature, 25);
        assert.equal(value.data.tiltAngle, 4);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
