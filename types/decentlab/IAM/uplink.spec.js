const chai = require("chai");
//const validate = require("jsonschema").validate;
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
let occupiedSchema = null;
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
    __dirname + "/occupied.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      occupiedSchema = JSON.parse(fileContents);
      done();
    }
  );
});

function loadRemoteSchema(uri) {
  return axios.get(uri).then(function (res) {
    if (res.status >= 400) {
      throw new Error("Schema loading error: " + res.statusCode);
    }
    return res.data;
  });
}

describe("Decentlab IAM Uplink", function () {
  describe("consume()", function () {
    it("should decode IAM payload", function (done) {
      const data = {
        data: {
          payload_hex: "020c2c007f0a5061927839bad8023100a58309000090e8001300eb",
        },
      };
      let sampleCount = 0;

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          const ajv = new Ajv({ loadSchema: loadRemoteSchema });
          ajv.compileAsync(defaultSchema).then(function (validate) {
            const valid = validate(value.data);
            console.log(validate.errors);
            assert.isTrue(valid);

            assert.equal(value.data.co2, 777);
            assert.equal(value.data.pir, 19);
            done();
          });
          sampleCount++;
        }

        if (value.topic === "occupied") {
          assert.equal(value.data.occupied, true);
          //validate(value.data, occupiedSchema, { throwError: true });
          sampleCount++;
        }

        if (sampleCount === 2) {
          //done();
        }
      });

      consume(data);
    });
    //TODO add test case for not occupied
  });
});
