var chai = require("chai");
var validate = require("jsonschema").validate;
var rewire = require("rewire");
var fs = require("fs");

var assert = chai.assert;

var script = rewire("./uplink.js");
var motionSchema = null;
var defaultSchema = null;
var consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(__dirname + "/motion.schema.json", "utf8", function (
    err,
    fileContents
  ) {
    if (err) throw err;
    motionSchema = JSON.parse(fileContents);
    done();
  });
});

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

describe("Elsys eye uplink", function () {
  describe("consume()", function () {
    it("should decode Elsys eye payload", function (done) {
      var data = {
        data: {
          payload_hex: "05011101",
        }
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "motion") {
          assert.equal(value.data.motion, 1);
          assert.equal(value.data.occupancy, 1);

          validate(value.data, motionSchema, { throwError: true });
          done();
        }
      });
      consume(data);
    });
  });
});

describe("Elsys eye uplink 2", function () {
  describe("consume()", function () {
    it("should decode Elsys eye Default + Motion payload", function (done) {

      // Default + Motion
      var data = {
        data: {
          payload_hex: "0100e102280401a00500070dff1102",
        },
      };

      var sampleCount = 0;
      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "motion") {
          assert.equal(value.data.motion, 0);
          assert.equal(value.data.occupancy, 2);

          validate(value.data, motionSchema, { throwError: true });
          sampleCount++;
        }

        if (value.topic == "default") {
          assert.equal(value.data.temperature, 22.5);
          assert.equal(value.data.humidity, 40);
          assert.equal(value.data.light, 416);
          assert.equal(value.data.vdd, 3583);
          validate(value.data, defaultSchema, { throwError: true });
          sampleCount++;
        }

        if (sampleCount == 2) {
          done();
        }
      });

      consume(data);

    });
  });
});