import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight EM300-DI Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight EM300-DI payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01755C0367340104686520CE9E74466310015D020000010000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 92);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 27.2);
        assert.equal(data.humidity, 46.5);
        assert.equal(data.pulse, 256);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 30.8);
        assert.equal(data.humidity, 50.5);
      });

      consume(data);
    });
  });
});
