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

describe("Milesight AM107", () => {
  describe("consume()", () => {
    it("should decode IAM payload", () => {
      const data = {
        data: {
          payloadHex:
            "01755C03673401046865056A490006651C0079001400077DE704087D070009733F27",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        expectEmit((type, value) => {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");

          if (value.topic === "default") {
            assert.equal(value.data.batteryLevel, 92);
            assert.equal(value.data.temperature, 30.08);
            assert.equal(value.data.humidity, 50.5);
            assert.equal(value.data.pir, 73);
            assert.equal(value.data.light, 28);
            assert.equal(value.data.visibleInfrared, 121);
            assert.equal(value.data.infrared, 20);
            assert.equal(value.data.co2, 1255);
            assert.equal(value.data.tvoc, 7);
            assert.equal(value.data.pressure, 1004.7);

            assert.equal(value.data.pir, 11);

            validate(value.data, defaultSchema, { throwError: true });
          }
        });
      });

      consume(data);
    });
  });
});
