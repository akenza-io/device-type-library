import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox RB11E uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let occupancySchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the R718LB data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "010301220A2800B4010000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.4);
        assert.equal(data.batteryLevel, 67);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 26);
        assert.equal(data.light, 180);
        assert.equal(data.alarm, false);
      });

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupied, true);
      });

      consume(data);
    });
  });
});
