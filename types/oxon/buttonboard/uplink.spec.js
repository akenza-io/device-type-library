const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const fs = require("fs");

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

describe("Oxon Buttonboard Uplink", () => {
  describe("consume()", () => {
    it("should decode the Oxon Buttonboard payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "31040000011c6418fe75014cf89eaf330001500128",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.hbIRQ, false);
          assert.equal(value.data.accIRQ, false);
          assert.equal(value.data.batteryLevel, 100);
          assert.equal(value.data.appMode, 1);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.longPressed, false);
          assert.equal(value.data.button1, false);
          assert.equal(value.data.button2, false);
          assert.equal(value.data.button3, true);
          assert.equal(value.data.button4, false);
          assert.equal(value.data.button5, false);
          assert.equal(value.data.button6, false);

          assert.equal(value.data.button1Enabled, false);
          assert.equal(value.data.button2Enabled, false);
          assert.equal(value.data.button3Enabled, true);
          assert.equal(value.data.button4Enabled, true);
          assert.equal(value.data.button5Enabled, true);
          assert.equal(value.data.button6Enabled, false);

          assert.equal(value.data.accX, -0.096);
          assert.equal(value.data.accY, 0.081);
          assert.equal(value.data.accZ, -0.461);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });
      consume(data);
    });
  });
});
