
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("Transmitter 600-038", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the 600-038 standard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0000AA0A0D1200000000000000000000000A00000000",
        },
      };

      // --- Lifecycle ---
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.id, 170);
        assert.equal(data.type, 10);
        assert.equal(data.seqCounter, 13);
        assert.equal(data.fwVersion, 18);
        assert.equal(data.batteryLevel, 100);
      });

      // --- Default (pulse OC + msgType) ---
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.pulseOc, 10);
        assert.equal(data.msgType, "NORMAL");
      });

      consume(data);
    });
  });
});
