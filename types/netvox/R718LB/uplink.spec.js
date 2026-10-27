import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R718LB uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the R718LB data report and emit correct samples", () => {
      const data = {
        data: {
          port: 6,
          payloadHex: "0125012401000000000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.6);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.reedContact, true);
      });

      consume(data);
    });
  });
});
