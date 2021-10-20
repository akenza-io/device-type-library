const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Kuando busylight Uplink", () => {
  let consume = null;
  before((done) => {
    const script = rewire("./downlink.js");
    consume = utils.init(script);
    done();
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

      utils.expectEmits((type, value) => {
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
