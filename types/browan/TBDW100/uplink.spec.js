var chai = require("chai");
var validate = require("jsonschema").validate;
var rewire = require("rewire");
var fs = require("fs");

var assert = chai.assert;

var script = rewire("./uplink.js");
var closedSchema = null;
var openedSchema = null;
var keepaliveSchema = null;
var defaultSchema = null;

var consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(__dirname + "/closed.schema.json", "utf8", function (
    err,
    fileContents
  ) {
    if (err) throw err;
    closedSchema = JSON.parse(fileContents);
    done();
  });
});

before(function (done) {
  fs.readFile(__dirname + "/opened.schema.json", "utf8", function (
    err,
    fileContents
  ) {
    if (err) throw err;
    openedSchema = JSON.parse(fileContents);
    done();
  });
});

before(function (done) {
  fs.readFile(__dirname + "/keepalive.schema.json", "utf8", function (
    err,
    fileContents
  ) {
    if (err) throw err;
    keepaliveSchema = JSON.parse(fileContents);
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

describe("TBDW100 uplink", function () {
  describe("consume()", function () {
    it("should decode TBDW100 payload", function (done) {
      var data = {
        data: {
          payload_hex: "01fc380000190000",
        }
      };
      var sampleCount = 0;
      expectEmit(function (type, value) {
        if (type == "sample") {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");
        } else {
          assert.equal(type, "state");
        }

        if (value.topic == "opened") {
          sampleCount++;
        }

        if (value.topic == "default") {
          assert.equal(value.data.bat, 80);
          assert.equal(value.data.batV, 4);
          assert.equal(value.data.time, 0);
          assert.equal(value.data.count, 0);
          assert.equal(value.data.status, "open");
          assert.equal(value.data.temperature, 24);

          validate(value.data, defaultSchema, { throwError: true });
          sampleCount++;
        }

        if (sampleCount == 2 || type !== "sample") {
          done();
        }
      });

      consume(data);
    });
  });
});