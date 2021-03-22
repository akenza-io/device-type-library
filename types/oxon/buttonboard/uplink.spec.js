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

describe("Oxon Touchpanel Uplink", function () {
  describe("consume()", function () {
    it("should decode the Oxon Touchpanel payload", function (done) {
      const data = {
        data: {
          port: 6,
          payload_hex: "31000100013f6412ffddffdaf7edaf330001500128",
        },
      };
      var count = 0;

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          count++;
          assert.equal(value.data.statusPercent, 100);
          assert.equal(value.data.heartbeat, true);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          count++;
          assert.equal(value.data.msgType, 49);
          assert.equal(value.data.buttonClicked, 0);
          assert.equal(value.data.imageH, 1);
          assert.equal(value.data.imageID, 63);
          assert.equal(value.data.temperature, 18);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });
      consume(data);
      if (count == 2) {
        done();
      }
    });
  });
});