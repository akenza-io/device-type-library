const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

const { assert } = chai;

const script = rewire("./uplink.js");
let defaultSchema = null;
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

function loadRemoteSchema(uri) {
  return axios.get(uri).then((res) => {
    if (res.status >= 400) {
      throw new Error(`Schema loading error: ${res.statusCode}`);
    }
    return res.data;
  });
}

describe("Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor Uplink", () => {
  describe("consume()", () => {
    it("should decode Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payload_hex: "010610007D0000010710725100009A21",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 32);
          assert.equal(value.data.soilHumidity, 20.85);
          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
