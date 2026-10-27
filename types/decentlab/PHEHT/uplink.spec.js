import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab PHEHT Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab PHEHT payload", () => {
      const data = {
        data: {
          payloadHex:
            "0252b800030000884282c77f637ff60c5c",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.ph, 7.11);
        assert.equal(data.phMv, -1);
        assert.equal(data.redox, -15.7);
        assert.equal(data.temperature, 21.14);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.164);
        assert.equal(data.deviceId, 21176);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.status, 0);
      });

      consume(data);
    });
  });
});