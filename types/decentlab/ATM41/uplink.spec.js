import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab ATM41 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab ATM41 payload", () => {
      const data = {
        data: {
          payloadHex:
            "02035a0003800a8000800080008009812b8014810880b4a57c820c810980027fe88056800880040bf5",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.precipitation, 0);
        assert.equal(data.lightningStrikeCount, 0);
        assert.equal(data.lightningAverageDistance, 0);
        assert.equal(data.windSpeed, 0.09);
        assert.equal(data.windDirection, 29.9);
        assert.equal(data.maximumWindSpeed, 0.2);
        assert.equal(data.temperature, 26.4);
        assert.equal(data.vaporPressure, 1.8);
        assert.equal(data.atmosphericPressure, 95.96);
        assert.equal(data.northWindSpeed, 0.08);
        assert.equal(data.eastWindSpeed, 0.04);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.batteryVoltage, 3.061);
        assert.equal(data.deviceID, 858);

        assert.equal(data.sensorTemperatureInternal, 26.5);
        assert.equal(data.xOrientationAngle, 0.2);
        assert.equal(data.yOrientationAngle, -2.4);
        assert.equal(data.compassHeading, 86);
      });

      consume(data);
    });
  });
});
