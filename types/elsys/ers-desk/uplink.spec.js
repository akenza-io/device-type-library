var chai = require("chai");
var validate = require("jsonschema").validate;
var rewire = require("rewire");
var fs = require("fs");

var assert = chai.assert;

var script = rewire("./uplink.js");
var motionSchema = null;
var internalTempSchema = null;
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
  fs.readFile(__dirname + "/internalTemp.schema.json", "utf8", function (
    err,
    fileContents
  ) {
    if (err) throw err;
    internalTempSchema = JSON.parse(fileContents);
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

describe("Elsys desk uplink", function () {
  describe("consume()", function () {
    it("should decode Elsys desk payload", function (done) {
      var data = {
        data: {
          payload_hex: "05011000f801041101",
        },
      };
      var sampleCount = 0;
      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "motion") {
          assert.equal(value.data.motion, 1);
          assert.equal(value.data.occupancy, 1);

          validate(value.data, motionSchema, { throwError: true });
          sampleCount++;
        }

        if (value.topic == "internalTemp") {
          assert.equal(value.data.irInternalTemperature, 24.8);
          assert.equal(value.data.irExternalTemperature, 26);
          validate(value.data, internalTempSchema, { throwError: true });
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

describe("Elsys desk uplink 2", function () {
  describe("consume()", function () {
    it("should decode Elsys desk Default + Motion payload", function (done) {

      // Default + Motion
      var data = {
        data: {
          payload_hex: "0100f102250400060505070e001100",
        },
      };

      var sampleCount = 0;
      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "motion") {
          assert.equal(value.data.motion, 5);
          assert.equal(value.data.occupancy, 0);

          validate(value.data, motionSchema, { throwError: true });
          sampleCount++;
        }

        if (value.topic == "default") {
          assert.equal(value.data.temperature, 24.1);
          assert.equal(value.data.humidity, 37);
          assert.equal(value.data.light, 6);
          assert.equal(value.data.vdd, 3584);
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