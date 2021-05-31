const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

const { assert } = chai;

const script = rewire("./uplink.js");
let defaultSchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before((done) => {
  fs.readFile(
    `${__dirname}/default.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      defaultSchema = JSON.parse(fileContents);
      done();
    },
  );
});
before((done) => {
  fs.readFile(
    `${__dirname}/lifecycle.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    },
  );
});

describe("Alevel V1", () => {
  describe("consume()", () => {
    it("should decode the Alevel V1 payload", () => {
      const data = {
        data: {
          payload_hex: "0746D8001700",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.batteryVoltage, 3.66);
          assert.equal(value.data.batteryLevel, 0);
          assert.equal(value.data.deviceStatusFlag, 0);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.currentLevel, 2.9);
          assert.equal(value.data.emptingFlag, false);
          assert.equal(value.data.tankingFlag, false);
          assert.equal(value.data.measurementError, false);
          assert.equal(value.data.outOfRangeError, true);
          assert.equal(value.data.sequenceNumber, 2);
          assert.equal(value.data.temperature, 23);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });
      consume(data);
    });
  });
});
