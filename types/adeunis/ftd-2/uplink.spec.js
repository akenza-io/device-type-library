const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let schema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}

before(function (done) {
  fs.readFile(__dirname + "/schema.json", "utf8", function (err, fileContents) {
    if (err) throw err;
    schema = JSON.parse(fileContents);
    done();
  });
});

describe("Adeunis FTD-2 Uplink", function () {
  describe("consume()", function () {
    it("should decode Adeunis payload", function (done) {
      let data = {
        data: {
          payload_hex: "416c61726d"
        }
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "uplink");
        //TODO get a real payload
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
        done();
      });

      consume(data);
    });
  });
});
