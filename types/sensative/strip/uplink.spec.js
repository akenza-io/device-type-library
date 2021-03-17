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
before(function (done) {
  fs.readFile(
    __dirname + "/alarm.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      alarmSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Sensative strip", function () {
  describe("consume()", function () {
    it("should decode the sensative strip payload", function (done) {
      const data = {
        data: {
          port: 1,
          payload_hex: "ffff09010a0052010000",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {

          assert.equal(value.data.historySeqNr, 65535);
          assert.equal(value.data.prevHistSeqNr, 65535);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {

          assert.equal(value.data.temperature, 0);
          assert.equal(value.data.door, true);

          validate(value.data, defaultSchema, { throwError: true });
        }

        if (value.topic === "alarm") {

          assert.equal(value.data.doorAlarm, false);

          validate(value.data, alarmSchema, { throwError: true });
        }
      });
      consume(data);
      done();
    });
  });
});
