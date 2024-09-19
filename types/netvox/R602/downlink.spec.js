const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("R602 Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire("./downlink.js");
    consume = utils.init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode the R602 startSiren payload", () => {
      const data = {
        payload: {
          actionType: "startWarning",
          sirenType: "FIRE_MODE",
          strobeMode: "LED_BLINK_1",
          duration: 10,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "90690001000a0000000000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 7);
      });

      consume(data);
    });
  });
});
