const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

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

function loadRemoteSchema(uri) {
  return axios.get(uri).then(function (res) {
    if (res.status >= 400) {
      throw new Error("Schema loading error: " + res.statusCode);
    }
    return res.data;
  });
}

describe("Decentlab PR36 Uplink", function () {
  describe("consume()", function () {
    it("should decode Decentlab PR36 payload", function (done) {
      const data = {
        data: {
          payload_hex: "02032b0003806797810c2b",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "lifecycle") {
          assert.equal(value.data.voltage, 3.115);
          assert.equal(value.data.protocolVersion, 2);
          assert.equal(value.data.deviceID, 811);
        }

        if (value.topic == "default") {
          assert.equal(value.data.pressure, 0.0125732421875);
          assert.equal(value.data.temperature, 23.50390625);
          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
