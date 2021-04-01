const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
let lifecycleSchema = null;
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
before(function (done) {
  fs.readFile(
    __dirname + "/lifecycle.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Synetica Status DB Uplink", function () {
  describe("consume()", function () {
    it("should decode the Synetica Status DB report uplink", function () {
      const data = {
        data: {
          port: 1,
          payload_hex: "0100f6021a2c409724bd2d403390e6420ce9",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {

          assert.equal(value.data.temperature, 24.6);
          assert.equal(value.data.humidity, 26);
          assert.equal(value.data.dp, 4.723);
          assert.equal(value.data.af, 2.806);

          validate(value.data, defaultSchema, { throwError: true });
        }

        if (value.topic === "lifecycle") {

          assert.equal(value.data.voltage, 3.305);

          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
