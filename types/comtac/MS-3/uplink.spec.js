const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const fs = require("fs");

const assert = chai.assert;

const script = rewire("./uplink.js");
let defaultSchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}


before(function (done) {
  fs.readFile(
    __dirname + "/default.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      defaultSchema = JSON.parse(fileContents);
      done();
    }
  );
});
before(function (done) {
  fs.readFile(
    __dirname + "/lifecycle.schema.json",
    "utf8",
    function (err, fileContents) {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Comtac LPN MS-3 Uplink", function () {
  describe("consume()", function () {
    it("should decode the Comtac LPN MS-3 payload", function (done) {
      const data = {
        data: {
          port: 3,
          payload_hex: "1300bc001f0100ff5ffecc03b10024fff2000dffc3016300177fffffff7fffffff0000",
        },
      };

      expectEmit(function (type, value) {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.rs485, false);
          assert.equal(value.data.gps, false);
          assert.equal(value.data.acc, true);
          assert.equal(value.data.mag, false);
          assert.equal(value.data.mic, false);
          assert.equal(value.data.bright, true);
          assert.equal(value.data.tempHum, true);

          assert.equal(value.data.txOnEvent, false);
          assert.equal(value.data.magActual, false);
          assert.equal(value.data.extCon, false);
          assert.equal(value.data.booster, false);
          assert.equal(value.data.extSupply, false);
          assert.equal(value.data.dip3, false);
          assert.equal(value.data.dip2, false);
          assert.equal(value.data.dip1, false);
          assert.equal(value.data.voltage, 2.88);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.brightness, 0);
          assert.equal(value.data.temperature, 25.6);
          assert.equal(value.data.humidity, 31);
          assert.equal(value.data.accX, -0.161);
          assert.equal(value.data.accY, -0.308);
          assert.equal(value.data.accZ, 0.945);
          assert.equal(value.data.gyroX, 3.6);
          assert.equal(value.data.gyroY, -1.4);
          assert.equal(value.data.gyroZ, 1.3);
          assert.equal(value.data.magnX, -0.061);
          assert.equal(value.data.magnY, 0.355);
          assert.equal(value.data.magnZ, 0.023);
          assert.equal(value.data.epe, 0);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
