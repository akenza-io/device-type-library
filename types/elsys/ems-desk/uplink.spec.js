const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let occupancySchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/occupancy.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      occupancySchema = JSON.parse(fileContents);
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

describe("Elsys EMS Desk uplink", function () {
  describe("consume()", function () {
    it("should decode Elsys EMS Desk payload", function () {
      const data = {
        data: {
          payload_hex: "070e241102",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "lifecycle") {
          assert.equal(value.data.voltage, 3.62);
        }

        if (value.topic == "occupancy") {
          assert.equal(value.data.occupancy, 2);
          validate(value.data, occupancySchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});