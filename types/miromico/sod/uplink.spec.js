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

describe("Miromico SOD Uplink", function () {
  describe("consume()", function () {
    it("should decode the Miromico SOD payload", function (done) {
      var data = { data: { payload_hex: "f3000000013c" } };
      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "button_pressed");

        assert.equal(value.data.bat, 96);
        assert.equal(value.data.msgtype, 0);
        assert.equal(value.data.count, 316);

        validate(value.data, schema, { throwError: true });

        done();
      });

      consume(data);
    });
  });
});
