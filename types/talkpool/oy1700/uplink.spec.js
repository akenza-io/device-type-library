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

describe("Talkpool OY1700 Uplink", function () {
  describe("consume()", function () {
    it("should decode the Talkpool OY1700 report uplink", function () {
      const data = {
        data: {
          port: 2,
          payload_hex: "4020b1000000000000",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {

          assert.equal(value.data.temperature, 23.5);
          assert.equal(value.data.humidity, 26.3);
          assert.equal(value.data.pm1, 0);
          assert.equal(value.data.pm2_5, 0);
          assert.equal(value.data.pm10, 0);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
