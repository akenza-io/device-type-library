import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab SHT35 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab SHT35 payload", () => {
      const data = {
        data: {
          payloadHex: "02030e000364a079b10c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 47.536430914778364);
        assert.equal(data.temperature, 23.787670710307466);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 782);
      });

      consume(data);
    });
  });
});
