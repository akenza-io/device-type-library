const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;

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
      defaultSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("TBDW100 uplink", function () {
  describe("consume()", function () {
    it("should decode TBDW100 payload", function (done) {
      const data = {
        data: {
          payload_hex: "01fc380000190000",
        },
      };

      expectEmit(function (type, value) {
        if (type === "sample") {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");

          if (value.topic === "default") {
            assert.equal(value.data.bat, 80);
            assert.equal(value.data.batV, 4);
            assert.equal(value.data.time, 0);
            assert.equal(value.data.count, 0);
            assert.equal(value.data.open, true);
            assert.equal(value.data.temperature, 24);

            validate(value.data, defaultSchema, { throwError: true });
          }
          done();
        }
      });

      consume(data);
    });
  });
});
