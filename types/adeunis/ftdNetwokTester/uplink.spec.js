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
          payloadHex: "416c61726d",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "uplink");
        // TODO get a real payload
        // assert.equal(value.data.altitude, 0);
        // assert.equal(value.data.rssi, -57);
        // assert.equal(value.data.uplink, 29);
        // assert.equal(value.data.downlink, 29);
        // assert.equal(value.data.snr, 7);
        // assert.equal(value.data.latitude, 47.41165);
        // assert.equal(value.data.temperature, 24);
        // assert.equal(value.data.sats, 7);
        // assert.equal(value.data.battery, 3009);
        // assert.equal(value.data.longitude, 8.5335);
        validate(value.data, schema, { throwError: true });
      });

      consume(data);
    });
  });
});
