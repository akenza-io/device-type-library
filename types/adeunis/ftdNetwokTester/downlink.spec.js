const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Adeunis FTD-2 Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire("./downlink.js");
    consume = utils.init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode Adeunis payload", () => {
      const data = {
        payload: {
          message: "Hello",
        },
      };

      utils.expectEmits((type, value) => {
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

      utils.expectEmits((type, value) => {
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
