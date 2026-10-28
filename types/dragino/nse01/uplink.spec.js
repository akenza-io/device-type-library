import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino NSE01 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino NSE01 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "f86778705021331700840cfd1b010000000ae80000000a6315537b0110034306f7004663185f19",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.soilConductivity, 0);
        assert.equal(data.soilDialecticConstant, 10);
        assert.equal(data.soilMoisture, 0);
        assert.equal(data.soilTemperature, 27.92);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.soilConductivity, 3566);
        assert.equal(data.soilDialecticConstant, 140);
        assert.equal(data.soilMoisture, 0);
        assert.equal(data.soilTemperature, 16.7);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.deviceId, "f867787050213317");
        assert.equal(data.interrupt, 0);
        assert.equal(data.mod, 1);
        assert.equal(data.signalStrength, 27);
        assert.equal(data.version, 132);
        assert.equal(data.batteryVoltage, 3.325);
        assert.equal(data.batteryLevel, 80);
      });

      consume(data);
    });
  });
});
