import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("LSN50 V2 D23 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let dsSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    dsSchema = loadSchema(`${import.meta.dirname}/ds.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the LSN50 V2 D23 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0e41008200000c0034fffd",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.c0adc, 0);
        assert.equal(data.digitalStatus, "LOW");
        assert.equal(data.extTrigger, false);
        assert.equal(data.open, false);
        assert.equal(data.temperature, 13);
      });

      expectSample("ds", dsSchema, (data) => {
        assert.equal(data.c2temperature, 5.2);
        assert.equal(data.c3temperature, -0.3);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.649);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
