import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab RHC Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab RHC payload", () => {
      const data = {
        data: {
          payloadHex:
            "0202e00003a9fd01341ca285f30c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 73.3);
        assert.equal(data.temperature, 15.23);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 736);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.sensorId, 20228605);
      });

      consume(data);
    });
  });
});