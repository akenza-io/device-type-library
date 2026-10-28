import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab WRM Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab WRM payload", () => {
      const data = {
        data: {
          payloadHex:
            "021a10000764a079b104f904c40c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 47.536430914778364);
        assert.equal(data.temperature, 23.787670710307466);
        assert.equal(data.headTemperature, 22);
        assert.equal(data.surfaceTemperature, 27.3);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 6672);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});