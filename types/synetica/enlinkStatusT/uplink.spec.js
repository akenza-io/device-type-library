import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Synetica Status T Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Synetica Status T report uplink", () => {
      const data = {
        data: {
          payloadHex: "0100f5021a1701cc420d02",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 26);
        assert.equal(data.temperature, 24.5);
        assert.equal(data.tempProbe1, 46);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.33);
      });

      consume(data);
    });
  });
});
