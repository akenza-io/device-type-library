const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const fs = require("fs");

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

describe("Globalsat LS-113G uplink", () => {
  describe("consume()", () => {
    it("should decode Globalsat LS-113G payload", (done) => {
      const data = {
        data: {
          payloadHex: "01096113950292",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "default") {
          assert.equal(value.data.co2, 658);
          assert.equal(value.data.humidity, 50.13);
          assert.equal(value.data.temperature, 24.01);
          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
