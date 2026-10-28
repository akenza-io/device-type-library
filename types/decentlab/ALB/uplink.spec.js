import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab ALB Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab ALB payload", () => {
      const data = {
        data: {
          payloadHex:
            "0252850003809980220bd3",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.albedo, 0.2222222222222222);
        assert.equal(data.incomingRadiation, 15.3);
        assert.equal(data.reflectedRadiation, 3.4);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.027);
        assert.equal(data.deviceId, 21125);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});