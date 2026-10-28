import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DS18 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DS18 payload", () => {
      const data = {
        data: {
          payloadHex:
            "02023d0003815e0c15",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 21.875);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.093);
        assert.equal(data.deviceId, 573);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});