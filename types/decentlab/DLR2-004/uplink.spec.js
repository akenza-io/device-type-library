import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab DLR2-004 Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab DLR2-004 payload", () => {
      const data = {
        data: {
          payloadHex:
            "0208b200038bb80c60",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.current, 13.73291015625);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.168);
        assert.equal(data.deviceId, 2226);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});