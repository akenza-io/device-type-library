const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
let buttonPressedSchema = null;
let statusSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/button_pressed.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      buttonPressedSchema = JSON.parse(fileContents);
      done();
    },
  );
});

before(function (done) {
  fs.readFile(
    __dirname + "/status.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      statusSchema = JSON.parse(fileContents);
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

describe("Miromico REV2_V5 uplink", function () {
  describe("consume()", function () {
    it("should decode Miromico REV2_V5 payload status", function (done) {
      const data = {
        data: {
          payloadHex: "0502e804000003038c27",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "status") {
          assert.equal(value.data.msgType, 2);
          assert.equal(value.data.usedCharges, 1256);
          assert.equal(value.data.battery, 3.1);
          assert.equal(value.data.internalTemp, 39);

          validate(value.data, statusSchema, { throwError: true });
        }

        done();
      });

      consume(data);
    });

    it("should decode Miromico REV2_V5 payload button pressed", function (done) {
      const data = {
        data: {
          payloadHex: "0502e804000003038c27",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "button_pressed") {
          assert.equal(value.data.msgType, 1);
          assert.equal(value.data.usedCharges, 502);
          assert.equal(value.data.buttonCount, 6);

          assert.equal(value.data.btnNfirst, 1);
          assert.equal(value.data.btnEfirst, 0);
          assert.equal(value.data.btnSfirst, 0);
          assert.equal(value.data.btnWfirst, 0);
          assert.equal(value.data.btnNpressed, 1);
          assert.equal(value.data.btnEpressed, 0);
          assert.equal(value.data.btnSpressed, 1);
          assert.equal(value.data.btnWpressed, 0);

          validate(value.data, buttonPressedSchema, { throwError: true });
        }

        done();
      });

      consume(data);
    });
  });
});
