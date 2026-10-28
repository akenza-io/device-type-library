import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab TRS12 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab TRS12 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0210d3000346be813d00000c80",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.dielectricPermittivity, 1.1831248966814998);
        assert.equal(data.electricalConductivity, 0);
        assert.equal(data.soilTemperature, 31.7);
        assert.equal(data.volumetricWaterContent, 0.006886900000000029);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.2);
        assert.equal(data.deviceId, 4307);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});