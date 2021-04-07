const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
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

describe("Talkpool OY1210 Uplink", function () {
  describe("consume()", function () {
    it("should decode the Talkpool OY1210 report uplink", function () {
      const data = {
        data: {
          port: 2,
          payload_hex: "3f1fb702b1",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {

          assert.equal(value.data.temperature, 21.9);
          assert.equal(value.data.humidity, 25.3);
          assert.equal(value.data.co2, 689);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
