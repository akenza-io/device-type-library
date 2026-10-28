import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab MES5 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Decentlab MES5 payload", () => {
      const data = {
        data: {
          payloadHex: "024E030003000088e6210800f223650af5",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.status, 0);
        assert.equal(data.temperature, 22.78);
        assert.equal(data.turbidity, 906.1);
        assert.equal(data.sludgeBlanket, 84.56);
        assert.equal(data.suspendedSolid, 2.42);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.805);
        assert.equal(data.protocolVersion, 2);
        assert.equal(data.deviceId, 19971);
      });

      consume(data);
    });
  });
});
