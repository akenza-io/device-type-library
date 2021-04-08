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

describe("Elsys EMS uplink", function () {
  describe("consume()", function () {
    it("should decode Elsys EMS payload", function () {
      const data = {
        data: {
          payload_hex: "0100e8021a0300ff3d070e360b0000000d0d010f141200",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "lifecycle") {
          assert.equal(value.data.voltage, 3.638);
        }

        if (value.topic == "default") {
          assert.equal(value.data.temperature, 23.2);
          assert.equal(value.data.humidity, 26);
          assert.equal(value.data.accX, 0);
          assert.equal(value.data.accY, 0);
          assert.equal(value.data.accZ, 1);
          assert.equal(value.data.reed, true);
          assert.equal(value.data.accMotion, 20);
          assert.equal(value.data.waterleak, false);
          assert.equal(value.data.pulseAbs1, 13);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});