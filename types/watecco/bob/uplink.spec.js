const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let reportSchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/report.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      reportSchema = JSON.parse(fileContents);
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

describe("Watecco BoB Uplink", function () {
  describe("consume()", function () {
    it("should decode the Watecco BoB report uplink", function (done) {
      const data = {
        data: {
          port: 1,
          payload_hex: "52087f5a00353e090019260c552a0000007c77ffffffffffffffff",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "report") {

          assert.equal(value.data.anomalyLevel, 6.299);
          assert.equal(value.data.nrAlarms, 0);
          assert.equal(value.data.temperature, 23);
          assert.equal(value.data.operatingTime, 180);
          assert.equal(value.data.repID, 9);
          assert.equal(value.data.maxAmplitude, 0.021);
          assert.equal(value.data.peakFrequency, 13);
          assert.equal(value.data.min0_10, 127.559);
          assert.equal(value.data.min10_20, 35.098);
          assert.equal(value.data.min20_40, 17.343);
          assert.equal(value.data.min40_60, 0);
          assert.equal(value.data.min60_80, 0);
          assert.equal(value.data.min80_100, 0);
          assert.equal(value.data.anomalyLvL20Hours, 119);
          assert.equal(value.data.anomalyLvL50Hours, 255);
          assert.equal(value.data.anomalyLvL80Hours, 255);
          assert.equal(value.data.anomalyLvL20Days, 255);
          assert.equal(value.data.anomalyLvL50Days, 255);
          assert.equal(value.data.anomalyLvL80Days, 255);
          assert.equal(value.data.anomalyLvL20Months, 255);
          assert.equal(value.data.anomalyLvL50Months, 255);
          assert.equal(value.data.anomalyLvL80Months, 255);

          validate(value.data, reportSchema, { throwError: true });
        }

        if (value.topic === "lifecycle") {

          assert.equal(value.data.batteryLevel, 97.638);

          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
