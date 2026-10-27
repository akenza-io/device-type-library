import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Sentinum Febris CO2 Mioty Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Sentinum Febris uplink payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "112302195204e32103cd069e0100056c",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.baseId, 1);
        assert.equal(data.batteryVoltage, 6.482);
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.internalTemperature, 25);
        assert.equal(data.majorVersion, 1);
        assert.equal(data.minorVersion, 2);
        assert.equal(data.productVersion, 3);
        assert.equal(data.upCnt, 2);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.alarm, "YELLOW");
        assert.equal(data.dewPoint, 8);
        assert.equal(data.co2, 1694);
        assert.equal(data.humidity, 33);
        assert.equal(data.pressure, 973);
      });

      consume(data);
    });
  });
});
