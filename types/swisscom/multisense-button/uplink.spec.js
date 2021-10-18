const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const fs = require("fs");

const { assert } = chai;

const script = rewire("./uplink.js");
let lifecycleSchema = null;
let buttonEventSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before((done) => {
  fs.readFile(
    `${__dirname}/lifecycle.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      buttonEventSchema = JSON.parse(fileContents);
      done();
    },
  );
});

before((done) => {
  fs.readFile(
    `${__dirname}/button_event.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    },
  );
});

describe("Swisscom Multisense Button Uplink", () => {
  describe("consume()", () => {
    it("should decode the Swisscom Multisense Button payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "020040b5",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.payloadVersion, 2);
          assert.equal(value.data.mode, 0);
          assert.equal(value.data.voltage, 3.086);
          assert.equal(value.data.batteryLevel, 71);
          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "button_event") {
          assert.equal(value.data.buttonPressed, true);
          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
