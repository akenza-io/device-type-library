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

describe("Dragino LSE01 Uplink", () => {
  describe("consume()", () => {
    it("should decode the Dragino LSE01 report uplink", () => {
      const data = {
        data: {
          port: 1,
          payload_hex: "CE2900F107A5099B6E2890",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 24.1);
          assert.equal(value.data.soilHumidity, 19.57);
          assert.equal(value.data.soilTemperature, 24.59);
          assert.equal(value.data.soilConductivity, 28200);

          validate(value.data, defaultSchema, { throwError: true });
        }

        if (value.topic === "lifecycle") {
          assert.equal(value.data.voltage, 3.625);

          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
