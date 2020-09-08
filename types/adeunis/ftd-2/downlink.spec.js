var chai = require("chai");
var rewire = require("rewire");

var assert = chai.assert;

var script = rewire("./downlink.js");
var consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

describe("Adeunis FTD-2 Downlink", function () {
  describe("consume()", function () {
    it("should encode Adeunis payload", function (done) {
      expectEmit(function (type, value) {
        assert.equal(type, "downlink");

        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.port, 1);
        assert.equal(value.payload_hex, "54657374");

        done();
      });

      var data = { payload: "Test" };
      consume(data);
    });
  });
});
