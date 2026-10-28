import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys TVOC uplink", () => {
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
    it("should decode Elsys TVOC payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100f702230401650503070e291c000c",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.light, 357);
        assert.equal(data.humidity, 35);
        assert.equal(data.temperature, 24.7);
        assert.equal(data.tvoc, 12);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.625);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.motion, 3);
      });

      consume(data);
    });
  });
});
