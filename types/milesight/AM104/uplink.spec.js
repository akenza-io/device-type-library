import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

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

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 27.2);
        assert.equal(data.humidity, 56.5);
        assert.equal(data.pir, 73);
        assert.equal(data.light, 28);
        assert.equal(data.visibleInfrared, 121);
        assert.equal(data.infrared, 20);
      });

      consume(data);
    });
  });
});
