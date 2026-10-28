import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab ATM22 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab ATM22 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0208c900038009812b8014810880027fe8800880040bf5",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 26.4);
        assert.equal(data.eastWindSpeed, 0.04);
        assert.equal(data.maximumWindSpeed, 0.2);
        assert.equal(data.northWindSpeed, 0.08);
        assert.equal(data.windDirection, 29.9);
        assert.equal(data.windSpeed, 0.09);
        assert.equal(data.xOrientationAngle, 0.2);
        assert.equal(data.yOrientationAngle, -2.4);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.061);
        assert.equal(data.deviceId, 2249);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});