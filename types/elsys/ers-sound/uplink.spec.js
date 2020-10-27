var chai = require("chai");
var validate = require("jsonschema").validate;
var rewire = require("rewire");
var fs = require("fs");

var assert = chai.assert;

var script = rewire("./uplink.js");
var schema = null;
var consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(__dirname + "/schema.json", "utf8", function (err, fileContents) {
    if (err) throw err;
    schema = JSON.parse(fileContents);
    done();
  });
});

describe("ERS Desk Uplink", function () {
  describe("consume()", function () {
    it("should decode ERS payload", function (done) {
      var data = { data: { payload_hex: "0100fe02290400010500070de91100" } };
      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.motion, 0);
        assert.equal(value.data.light, 1);
        assert.equal(value.data.occupancy, 0);
        assert.equal(value.data.vdd, 3561);
        assert.equal(value.data.temperature, 25.4);
        assert.equal(value.data.humidity, 41);

        validate(value.data, schema, { throwError: true });

        done();
      });

      consume(data);
    });
  });
});
