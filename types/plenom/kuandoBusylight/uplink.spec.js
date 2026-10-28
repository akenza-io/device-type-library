import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Kuando busylight Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Kuando busylight payload", () => {
      const data = {
        data: {
          payloadHex: "a9ffffff230000000300000002000000ffff0064021f0c01",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.lastColorRGB, "255,0,255");
        assert.equal(data.timeOn, 100);
        assert.equal(data.timeOff, 2);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.rssi, -87);
        assert.equal(data.snr, 35);
        assert.equal(data.downlinksReceived, 3);
        assert.equal(data.uplinksSent, 2);
        assert.equal(data.swRevision, 31);
        assert.equal(data.hwRevision, 12);
        assert.equal(data.adrState, 1);
      });

      consume(data);
    });
  });
});
