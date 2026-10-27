import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

describe("Kuando busylight Downlink", () => {
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/downlink.js`));
  });

  describe("consume()", () => {
    it("should decode the Kuando busylight payload", () => {
      const data = {
        payload: {
          red: 12,
          green: 20,
          blue: 34,
          onDuration: 255,
          offDuration: 255,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "0c2214ffff");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 15);
      });

      consume(data);
    });
  });
});
