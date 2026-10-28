import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab PR26 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode Decentlab PR26 payload", () => {
      const data = {
        data: {
          payloadHex: "020167000345cb60170c7f",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pressure, 0.04526);
        assert.equal(data.temperature, 25.67188);
        assert.equal(data.level, 0.46148);
        assert.equal(data.levelCm, 46.148);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.199);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceID, 359);
      });

      consume(data);
    });
  });
});
