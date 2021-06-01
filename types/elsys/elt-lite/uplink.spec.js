const chai = require("chai");
const {validate} = require("jsonschema");
const rewire = require("rewire");
const fs = require("fs");

const {assert} = chai;

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
    `${__dirname  }/default.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      defaultSchema = JSON.parse(fileContents);
      done();
    }
  );
});

before((done) => {
  fs.readFile(
    `${__dirname  }/lifecycle.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Elsys ELT Lite uplink", () => {
  describe("consume()", () => {
    it("should decode Elsys ELT Lite payload", () => {
      const data = {
        data: {
          payload_hex: "0100e20218070e410cff5614000edd20",
        }
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "lifecycle") {
          assert.equal(value.data.voltage, 3.649);
        }

        if (value.topic == "default") {
          assert.equal(value.data.temperature, 22.6);
          assert.equal(value.data.humidity, 24);
          assert.equal(value.data.pressure, 974.112);
          assert.equal(value.data.externalTemperature1, -17);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});