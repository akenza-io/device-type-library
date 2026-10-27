import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

describe("AM104 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the AM104 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403671001046871056a490006651c0079001400",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.batteryLevel, 100);
          validateSchema(value.data, lifecycleSchema, {
            throwError: true,
          });
        }
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 27.2);
          assert.equal(value.data.humidity, 56.5);
          assert.equal(value.data.pir, 73);
          assert.equal(value.data.light, 28);
          assert.equal(value.data.visibleInfrared, 121);
          assert.equal(value.data.infrared, 20);

          validateSchema(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
