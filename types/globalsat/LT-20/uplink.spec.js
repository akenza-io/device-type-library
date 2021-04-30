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

describe("Globalsat LT-20 uplink", function () {
  describe("consume()", function () {
    it("should decode Globalsat LT-20 payload", function () {
      const data = {
        data: {
          payload_hex: "80029e3856005123424300",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "default") {
          assert.equal(value.data.longitude, 121.487685);
          assert.equal(value.data.latitude, 49.761663999999996);
          assert.equal(value.data.reportType, "Periodic mode report");
          assert.equal(value.data.gpsFix, "3D fix");

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
