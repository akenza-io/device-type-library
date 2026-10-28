import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

describe("R602 Downlink", () => {
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/downlink.js`));
  });

  describe("consume()", () => {
    it("should encode the R602 startSiren payload", () => {
      const data = {
        payload: {
          actionType: "startWarning",
          warningMode: "DOORBELL",
          strobeMode: "LED_BLINK_2",
          duration: 3,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "9069030200030000000000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 7);
      });

      consume(data);
    });
  });
});
