import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab SMTP Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab SMTP payload", () => {
      const data = {
        data: {
          payloadHex:
            "020b50000309018a8c09438a9809278a920b3c8aa50c9c8a8c11e08aa500000000000000000b3b",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.soilMoistureAtDepth0, -0.39);
        assert.equal(data.soilTemperatureAtDepth0, 27);
        assert.equal(data.soilMoistureAtDepth1, -0.258);
        assert.equal(data.soilTemperatureAtDepth1, 27.12);
        assert.equal(data.soilMoistureAtDepth2, -0.314);
        assert.equal(data.soilTemperatureAtDepth2, 27.06);
        assert.equal(data.soilMoistureAtDepth3, 0.752);
        assert.equal(data.soilTemperatureAtDepth3, 27.25);
        assert.equal(data.soilMoistureAtDepth4, 1.456);
        assert.equal(data.soilTemperatureAtDepth4, 27);
        assert.equal(data.soilMoistureAtDepth5, 4.152);
        assert.equal(data.soilTemperatureAtDepth5, 27.25);
        assert.equal(data.soilMoistureAtDepth6, -5);
        assert.equal(data.soilTemperatureAtDepth6, -327.68);
        assert.equal(data.soilMoistureAtDepth7, -5);
        assert.equal(data.soilTemperatureAtDepth7, -327.68);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.875);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 2896);
      });

      consume(data);
    });
  });
});
