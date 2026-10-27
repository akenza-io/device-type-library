import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys ERS uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let occupancySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ERS payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100f1021704041a0500070e5a",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 1050);
        assert.equal(data.humidity, 23);
        assert.equal(data.temperature, 24.1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.674);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.motion, 0);
      });

      consume(data);
    });
  });
});
