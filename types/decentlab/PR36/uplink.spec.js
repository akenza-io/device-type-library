import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";

describe("Decentlab PR36 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab PR36 payload", () => {
      const data = {
        data: {
          payloadHex: "02032b0003806797810c2b",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pressure, 0.0125732421875);
        assert.equal(data.temperature, 23.50390625);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.batteryVoltage, 3.115);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 811);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
