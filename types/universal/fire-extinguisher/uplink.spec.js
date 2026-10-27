import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Universal fire extinguisher", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the universal fire extinguisher payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0012c800004a7b",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.payloadVersion, 0);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.isTestMessage, false);
        assert.equal(data.isRemoved, true);
        assert.equal(data.isSecurityUnlocked, false);
      });

      consume(data);
    });
  });
});
