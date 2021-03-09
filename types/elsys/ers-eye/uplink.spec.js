const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let motionSchema = null;
let defaultSchema = null;
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
      motionSchema = JSON.parse(fileContents);
      done();
    }
  );
});

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

describe("Elsys eye uplink", function () {
  describe("consume()", function () {
    it("should decode Elsys eye payload", function (done) {
      const data = {
        data: {
          payload_hex: "05011101",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "motion") {
          assert.equal(value.data.motion, 1);
          assert.equal(value.data.occupancy, 1);

          validate(value.data, motionSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });

    it("should decode Elsys eye Default + Motion payload", function (done) {
      // Default + Motion
      const data = {
        data: {
          payload_hex: "0100e102280401a00500070dff1102",
        },
      };
      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "motion") {
          assert.equal(value.data.motion, 0);
          assert.equal(value.data.occupancy, 2);

          validate(value.data, motionSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 22.5);
          assert.equal(value.data.humidity, 40);
          assert.equal(value.data.light, 416);
          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
