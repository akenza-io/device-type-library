import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

describe("Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010610007D0000010710725100009A21",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 32);
          assert.equal(value.data.soilHumidity, 20.85);
          validateSchema(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
