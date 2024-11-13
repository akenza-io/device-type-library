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

    it("should encode the UC51X valve rule payload", () => {
      const data = {
        payload: {
          actionType: "milesightRule",
          valve: 1,
          timeControl: true,
          flowControl: true,
          pulse: 1000,
          open: true,
          ruleId: 2,
          enable: true,
          start: 1709222400,
          end: 1726823936,
          loop: true,
          period: "DAILY",
          interval: 2,
          durationSeconds: 300,
          weekdays: { monday: true, tuesday: true, wednesday: true, thursday: true },
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);
        assert.equal(value.payloadHex, "ff5502010100aae065003eed6601010200020101012c01000001e8030000");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 85);
      });

      consume(data);
    });
  });
});