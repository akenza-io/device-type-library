const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const fs = require("fs");

const { assert } = chai;

const script = rewire("./uplink.js");
let schema = null;
const consume = script.__get__("consume");

describe("Adeunis FTD-2 Uplink", () => {
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
        schema = JSON.parse(fileContents);
        done();
      },
    );
  });
  describe("consume()", () => {
    it("should decode Adeunis payload", () => {
      const data = {
        data: {
          payloadHex: "1234abcdb000000b",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.trigger, "PUSHBUTTON");
        assert.equal(value.data.downlink, 52);

        validate(value.data, schema, { throwError: true });
      });

      consume(data);
    });
  });
});
