const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

const { assert } = chai;

const script = rewire("./uplink.js");
let currentSchema = null;
let measurementHistorySchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before((done) => {
  fs.readFile(
    `${__dirname}/current.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      currentSchema = JSON.parse(fileContents);
      done();
    },
  );
});

before((done) => {
  fs.readFile(
    `${__dirname}/measurement_history.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      measurementHistorySchema = JSON.parse(fileContents);
      done();
    },
  );
});

describe("Tekelek TEK766 Uplink", () => {
  describe("consume()", () => {
    it("should decode Tekelek TEK766 payload", () => {
      const data = {
        data: {
          payload_hex: "1000000001121B7701131BAA01121BA90114F274",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "current") {
          assert.equal(value.data.limit1Exceeded, false);
          assert.equal(value.data.limit2Exceeded, false);
          assert.equal(value.data.limit3Exceeded, false);
          assert.equal(value.data.ullage, 274);
          assert.equal(value.data.temperature, 27);
          assert.equal(value.data.src, 7);
          assert.equal(value.data.srssi, 7);
          validate(value.data, currentSchema, { throwError: true });
        }

        if (value.topic === "measurement_history") {
          assert.equal(value.data.ullage1, 275);
          assert.equal(value.data.temperature1, 27);
          assert.equal(value.data.src1, 10);
          assert.equal(value.data.srssi1, 10);

          assert.equal(value.data.ullage2, 274);
          assert.equal(value.data.temperature2, 27);
          assert.equal(value.data.src2, 9);
          assert.equal(value.data.srssi2, 10);

          assert.equal(value.data.ullage3, 276);
          assert.equal(value.data.temperature3, -14);
          assert.equal(value.data.src3, 4);
          assert.equal(value.data.srssi3, 7);
          validate(value.data, measurementHistorySchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
