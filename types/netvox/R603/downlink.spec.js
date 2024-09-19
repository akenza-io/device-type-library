const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("R603 Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire("./downlink.js");
    consume = utils.init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode the R603 startSiren payload", () => {
      const data = {
        payload: {
          actionType: "startSiren",
          sirenType: "EMERGENCY",
          sirenIntensity: 15,
          strobeMode: "FLOWING",
          duration: 10,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "03DE000f01000a00000000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 7);
      });

      consume(data);
    });

    it("should encode the R603 setColor payload", () => {
      const data = {
        payload: {
          actionType: "setColor",
          red: 255,
          green: 0,
          blue: 0,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "07DEff0000000000000000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 7);
      });

      consume(data);
    });
  });
});
