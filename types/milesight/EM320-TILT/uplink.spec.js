
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("EM320-TILT Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the EM320-TILT payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403D4000001005046",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.xAngle, 0);
        assert.equal(data.yAngle, 0);
        assert.equal(data.zAngle, 90);
        assert.equal(data.xThresholdReached, false);
        assert.equal(data.yThresholdReached, true);
        assert.equal(data.zThresholdReached, false);
      });

      consume(data);
    });
  });
});
