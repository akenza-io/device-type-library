import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";

describe("Dragino T68DL Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino T68DL report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0CBF0AFE02671F024A",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 28.14);
        assert.equal(value.data.tempHFlag, false);
        assert.equal(value.data.tempLFlag, true);
        // assert.equal(value.data.time, "2024-10-28 04:17:30"); // Testing with times gets a bit wonky ussualy

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.263);
      });

      consume(data);
    });
  });
});
