import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R718WA uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the R718WA data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0132012400000000000000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.waterLeak, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.batteryLevel, 100);
      });
      consume(data);
    });
  });
});
