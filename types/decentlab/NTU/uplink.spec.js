import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab NTU Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab NTU payload", () => {
      const data = {
        data: {
          payloadHex:
            "022332000300008885013e013e02330b10",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 21.81);
        assert.equal(data.turbidityInFnu, 31.8);
        assert.equal(data.turbidityInMgL, 56.3);
        assert.equal(data.turbidityInNtu, 31.8);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.832);
        assert.equal(data.deviceId, 9010);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.status, 0);
      });

      consume(data);
    });
  });
});