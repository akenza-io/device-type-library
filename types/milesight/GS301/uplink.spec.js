import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight GS301 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight GS301 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756402671C01036864047D0000057D0100",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 28.4);
        assert.equal(data.humidity, 50);
        assert.equal(data.h2s, 0.01);
        assert.equal(data.nh3, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
