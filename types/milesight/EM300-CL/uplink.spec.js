import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight EM300-CL Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight EM300-CL payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403ED00",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.liquid, "UNCALIBRATED");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode should decode the Milesight EM300-CL payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "83ED0201",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.liquid, "EMPTY");
        assert.equal(data.liquidAlarm, "EMPTY_ALARM");
      });

      consume(data);
    });
  });
});
