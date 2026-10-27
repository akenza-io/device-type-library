import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino LHT65N VIB Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let datalogSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    datalogSchema = loadSchema(`${import.meta.dirname}/datalog.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino LHT65N report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0bc60a000000000b220212",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alarm, false);
        assert.equal(data.tdc, true);
        assert.equal(data.humidity, 53);
        assert.equal(data.temperature, 28.5);
        assert.equal(data.vibrationCount, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.014);
      });

      consume(data);
    });
  });
});
