var chai = require("chai");
var validate = require("jsonschema").validate;
var rewire = require("rewire");
var fs = require("fs");

var assert = chai.assert;

var script = rewire("./uplink.js");
var defaultSchema = null;
var consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(__dirname + "/schema.json", "utf8", function (
    err,
    fileContents
  ) {
    if (err) throw err;
    defaultSchema = JSON.parse(fileContents);
    done();
  });
});

describe("Elsys CO2 uplink", function () {
  describe("consume()", function () {
    it("should decode Elsys CO2 payload", function (done) {
      var data = {
        data: {
          payload_hex: "0100f4022804000b05000601d8070e3e",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.co2, 472);
        assert.equal(value.data.vdd, 3646);
        assert.equal(value.data.light, 11);
        assert.equal(value.data.motion, 0);
        assert.equal(value.data.humidity, 40);
        assert.equal(value.data.temperature, 24.4);

        validate(value.data, defaultSchema, { throwError: true });
        done();
      });

      consume(data);
    });
  });
});