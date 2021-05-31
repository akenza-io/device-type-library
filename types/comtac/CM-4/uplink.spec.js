const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const fs = require("fs");

const { assert } = chai;

const script = rewire("./uplink.js");
let defaultSchema = null;
let historySchema = null;
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
    `${__dirname}/history.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      historySchema = JSON.parse(fileContents);
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

describe("Comtac LPN CM-4 Uplink", () => {
  describe("consume()", () => {
    it("should decode the Comtac LPN CM-4 payload default", () => {
      const data = {
        data: {
          port: 3,
          payload_hex: "011204C603090B40",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.batLow, false);
          assert.equal(value.data.lastTempValid, true);
          assert.equal(value.data.extMEM, false);
          assert.equal(value.data.acc, false);
          assert.equal(value.data.tempI2C, true);
          assert.equal(value.data.tempPt100, false);
          assert.equal(value.data.infoReq, false);
          assert.equal(value.data.configRX, false);
          assert.equal(value.data.button, false);
          assert.equal(value.data.alarming, true);
          assert.equal(value.data.history, false);
          assert.equal(value.data.async, false);
          assert.equal(value.data.batteryLevel, 99);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 23.15);
          assert.equal(value.data.humidity, 64);

          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
  describe("consume()", () => {
    it("should decode the Comtac LPN CM-4 payload history", () => {
      const data = {
        data: {
          port: 3,
          payload_hex:
            "011202C604090B40090B40090B40090B40090B40090B40090B40090B40",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.batLow, false);
          assert.equal(value.data.lastTempValid, true);
          assert.equal(value.data.extMEM, false);
          assert.equal(value.data.acc, false);
          assert.equal(value.data.tempI2C, true);
          assert.equal(value.data.tempPt100, false);
          assert.equal(value.data.infoReq, false);
          assert.equal(value.data.configRX, false);
          assert.equal(value.data.button, false);
          assert.equal(value.data.alarming, false);
          assert.equal(value.data.history, true);
          assert.equal(value.data.async, false);
          assert.equal(value.data.batteryLevel, 99);

          validate(value.data, lifecycleSchema, { throwError: true });
        }

        if (value.topic === "history") {
          assert.equal(value.data.temperature, 23.15);
          assert.equal(value.data.humidity, 64);
          assert.equal(value.data.tempHistory1, 23.15);
          assert.equal(value.data.humHistory1, 64);
          assert.equal(value.data.tempHistory2, 23.15);
          assert.equal(value.data.humHistory2, 64);
          assert.equal(value.data.tempHistory3, 23.15);
          assert.equal(value.data.humHistory3, 64);
          assert.equal(value.data.tempHistory4, 23.15);
          assert.equal(value.data.humHistory4, 64);
          assert.equal(value.data.tempHistory5, 23.15);
          assert.equal(value.data.humHistory5, 64);
          assert.equal(value.data.tempHistory6, 23.15);
          assert.equal(value.data.humHistory6, 64);
          assert.equal(value.data.tempHistory7, 23.15);
          assert.equal(value.data.humHistory7, 64);

          validate(value.data, historySchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
