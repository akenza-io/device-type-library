import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

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

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 28.14);
        assert.equal(data.tempHFlag, false);
        assert.equal(data.tempLFlag, true);

        // assert.equal(value.data.time, "2024-10-28 04:17:30"); // Testing with times gets a bit wonky ussualy
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.263);
      });

      consume(data);
    });
  });
});
