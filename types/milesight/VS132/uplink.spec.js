import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("VS132 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let defaultSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the VS121 lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "FF0101FF166614C39694870000FF090102FF1F8401000103D2BE00000004D23101000005CC00000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.firmwareVersion, "132.1.0.1");
        assert.equal(data.hardwareVersion, "1.2");
        assert.equal(data.protocolVersion, 1);
        assert.equal(data.sn, "6614c39694870000");
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.periodicCounterIn, 0);
        assert.equal(data.periodicCounterOut, 0);
        assert.equal(data.totalCounterIn, 190);
        assert.equal(data.totalCounterOut, 305);
      });

      consume(data);
    });
  });
});
