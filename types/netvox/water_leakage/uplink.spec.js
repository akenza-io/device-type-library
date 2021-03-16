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

describe("Netvox water leakage uplink", function () {
  describe("consume()", function () {
    it("should decode the Netvox water leakage uplink", function () {
      const data = {
        data: {
          port: 6,
          payload_hex: "0106011c00000000000000",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.leak, false);

          validate(value.data, defaultSchema, { throwError: true });
        }

        if (value.topic === "lifecycle") {
          assert.equal(value.data.voltage, 2.8);

          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
