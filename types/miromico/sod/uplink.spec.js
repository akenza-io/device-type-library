const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let schema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/default.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      schema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Miromico SOD Uplink", function () {
  describe("consume()", function () {
    it("should decode the Miromico SOD payload", function (done) {
      const data = {
        data: {
          payload_hex: "f3000000013c",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "button_pressed");

        validate(value.data, schema, { throwError: true });

        done();
      });

      consume(data);
    });
  });
});
