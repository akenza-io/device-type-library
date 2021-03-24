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

describe("Oxon Buttonboard Uplink", function () {
  describe("consume()", function () {
    it("should decode the Oxon Buttonboard payload", function () {
      const data = {
        data: {
          port: 1,
          payload_hex: "31040000013f6418ff20ffd21011af330001500121",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {

          assert.equal(value.data.hbIRQ, false);
          assert.equal(value.data.accIRQ, false);
          assert.equal(value.data.statusPercent, 100);
          assert.equal(value.data.appMode, 1);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.buttonID, 4);
          assert.equal(value.data.enabledButtonsId, 63);
          assert.equal(value.data.accelerometerX, -0.055);
          assert.equal(value.data.accelerometerY, -0.011);
          assert.equal(value.data.accelerometerZ, 1.004);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });
      consume(data);
    });
  });
});