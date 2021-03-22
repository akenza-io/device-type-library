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

describe("Comtac LPN DO-2 Uplink", function () {
  describe("consume()", function () {
    it("should decode the Comtac LPN DO-2 payload", function (done) {
      const data = {
        data: {
          port: 2,
          payload_hex: "14000977ef00",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.do_1, 0);
        assert.equal(value.data.do_2, 0);
        assert.equal(value.data.do_1_lora, 0);
        assert.equal(value.data.do_2_lora, 0);
        assert.equal(value.data.manually, 0);

        validate(value.data, schema, { throwError: true });

        done();
      });

      consume(data);
    });
  });
});
