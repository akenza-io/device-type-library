
import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

describe("Adeunis FTD-2 Downlink", () => {
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/downlink.js`));
  });

  describe("consume()", () => {
    it("should encode Adeunis payload", () => {
      const data = {
        payload: {
          message: "Hello",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.port, 1);
        assert.equal(value.confirmed, false);
        assert.equal(value.payloadHex, "48656c6c6f");
      });

      consume(data);
    });

    it("should encode Adeunis payload with specific port and confirmed", () => {
      const data = {
        payload: {
          message: "Test",
        },
        confirmed: true,
        port: 123,
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.port, 123);
        assert.equal(value.confirmed, true);
        assert.equal(value.payloadHex, "54657374");
      });
      consume(data);
    });
  });
});
