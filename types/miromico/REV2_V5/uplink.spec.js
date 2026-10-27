import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Miromico REV2_V5 uplink", () => {
  let statusSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Miromico REV2_V5 status payload", () => {
      const data = {
        data: {
          payloadHex: "0502e804000003038c27",
        },
      };

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.usedCharges, 1256);
        assert.equal(data.batteryVoltage, 3.1);
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.internalTemp, 39);
      });

      consume(data);
    });
  });
});
