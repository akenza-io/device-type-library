const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let schema = null;
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
      schema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("PNIcorp place pode Uplink", function () {
  describe("consume()", function () {
    it("should decode the PNIcorp place pode Sensor payload", function () {
      const data = {
        data: {
          port: 2,
          payload_hex: "376600",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "occupancy");

        assert.equal(value.data.occupancy, 0);

        validate(value.data, schema, { throwError: true });

      });

      consume(data);
    });
  });
});
