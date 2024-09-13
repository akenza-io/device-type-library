const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("UC51X Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire("./downlink.js");
    consume = utils.init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode the UC51X simple valve control payload", () => {
      const data = {
        payload: {
          actionType: "control",
          open: true,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "ff1d2100");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 85);
      });

      consume(data);
    });

    it("should encode the UC51X timed valve control payload", () => {
      const data = {
        payload: {
          actionType: "timedControl",
          open: true,
          durationSeconds: 20,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "ff1da100140000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 85);
      });

      consume(data);
    });

    it("should encode the UC51X valve schedule payload", () => {
      const data = {
        payload: {
          actionType: "milesightSchedule",
          valve: 1,
          open: true,
          schedule: 1,
          enable: true,
          weekdays: { monday: true, tuesday: true },
          start: "0900",
          end: "1500",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "ff4d01c10309000f000000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 85);
      });

      consume(data);
    });
  });
});
