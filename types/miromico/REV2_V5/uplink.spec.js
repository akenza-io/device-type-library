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

describe("Decentlab IAM Uplink", function () {
  describe("consume()", function () {
    it("should decode IAM payload", function (done) {
      var data = { data: { payload_hex: "020c2c007f0a5061927839bad8023100a58309000090e8001300eb" } };
      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.co2, 777);
        assert.equal(value.data.pir, 19);

        validate(value.data, schema, { throwError: true });

        done();
      });

      consume(data);
    });
  });
});
