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

describe("MCF-LW12CO2E Uplink", () => {
  describe("consume()", () => {
    it("should decode the MCF-LW12CO2E uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "CE2900F107A5099B6E2890",
        },
      };

      /* 
port 2
payloadHex 0ee040f62ac40b4c6e8a016d0119008f02e040f62ac40b4c6e8a01720119008f0262

port 2
payloadHex 0af640f62a020000000000000002000000

port 2
payloadHex 01cbe38b28000223040701
      */

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
