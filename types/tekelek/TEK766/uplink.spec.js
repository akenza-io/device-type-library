const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

const assert = chai.assert;

const script = rewire("./uplink.js");
let currentSchema = null;
let measurementSchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(
    __dirname + "/current.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      currentSchema = JSON.parse(fileContents);
      done();
    }
  );
});

before(function (done) {
  fs.readFile(
    __dirname + "/measurement.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      measurementSchema = JSON.parse(fileContents);
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

describe("Tekelek TEK766 Uplink", function () {
  describe("consume()", function () {
    it("should decode Tekelek TEK766 payload", function () {
      const data = {
        data: {
          payload_hex: "1000000001121B7701131BAA01121BA90114F274",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "current") {
          assert.equal(value.data.lim1, false);
          assert.equal(value.data.lim2, false);
          assert.equal(value.data.lim3, false);
          assert.equal(value.data.ullage1, 274);
          assert.equal(value.data.temp1, 27);
          assert.equal(value.data.SRC1, 7);
          assert.equal(value.data.SRSSI1, 7);
          validate(value.data, currentSchema, { throwError: true });
        }

        if (value.topic == "measurement") {
          assert.equal(value.data.lim1, false);
          assert.equal(value.data.lim2, false);
          assert.equal(value.data.lim3, false);
          assert.equal(value.data.ullage1, 274);
          assert.equal(value.data.temp1, 27);
          assert.equal(value.data.SRC1, 7);
          assert.equal(value.data.SRSSI1, 7);

          assert.equal(value.data.ullage2, 275);
          assert.equal(value.data.temp2, 27);
          assert.equal(value.data.SRC2, 10);
          assert.equal(value.data.SRSSI2, 10);

          assert.equal(value.data.ullage3, 274);
          assert.equal(value.data.temp3, 27);
          assert.equal(value.data.SRC3, 10);
          assert.equal(value.data.SRSSI3, 9);

          assert.equal(value.data.ullage4, 276);
          assert.equal(value.data.temp4, -14);
          assert.equal(value.data.SRC4, 7);
          assert.equal(value.data.SRSSI4, 4);
          validate(value.data, measurementSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
