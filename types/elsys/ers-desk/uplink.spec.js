const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let motionSchema = null;
let internalTempSchema = null;
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
    },
  );
});

before(function (done) {
  fs.readFile(
    __dirname + "/lifecycle.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      internalTempSchema = JSON.parse(fileContents);
      done();
    },
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
    },
  );
});

describe("Elsys desk uplink", function () {
  describe("consume()", function () {
    it("should decode Elsys desk payload", function (done) {
      const data = {
        data: {
          payloadHex: "05011000f801041101",
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

        if (value.topic === "lifecycle") {
          assert.equal(value.data.irInternalTemperature, 24.8);
          assert.equal(value.data.irExternalTemperature, 26);
          validate(value.data, internalTempSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });

    it("should decode Elsys desk Default + Motion payload", function (done) {
      // Default + Motion
      const data = {
        data: {
          payloadHex: "0100f102250400060505070e001100",
        },
      };
      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "motion") {
          assert.equal(value.data.motion, 5);
          assert.equal(value.data.occupancy, 0);

          validate(value.data, motionSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 24.1);
          assert.equal(value.data.humidity, 37);
          assert.equal(value.data.light, 6);
          //assert.equal(value.data.vdd, 3584);
          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
