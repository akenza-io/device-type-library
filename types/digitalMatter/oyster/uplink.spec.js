const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let positionSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}


before(function (done) {
  fs.readFile(
    __dirname + "/position.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      positionSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Digital matter Oyster Uplink", function () {
  describe("consume()", function () {
    it("should decode the digital matter Oyster payload", function () {
      const data = {
        data: {
          port: 1,
          payload_hex: "53AB783C0421F98E940AB3",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "position") {
          assert.equal(value.data.latitudeDeg, 101.4541139);
          assert.equal(value.data.longitudeDeg, -189.6275708);
          assert.equal(value.data.inTrip, false);
          assert.equal(value.data.fixFailed, false);
          assert.equal(value.data.headingDeg, 208.125);
          assert.equal(value.data.speedKmph, 10);
          assert.equal(value.data.voltage, 4.48);

          validate(value.data, positionSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
