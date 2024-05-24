const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("UC300 uplink payload", () => {
  let consume = null;
  before(() => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
  });

  describe("consume()", () => {
    it("should decode UC300 Custom Report payload", () => {
      const data = {
        data: {
          payloadHex: "61636874756e67206261627921",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm_report");
        assert.equal(value.data.text, "achtung baby!");
      });

      consume(data);
    });
  });
});
