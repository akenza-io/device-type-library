const chai = require("chai");
const {validate} = require("jsonschema");
const rewire = require("rewire");
const fs = require("fs");

const {assert} = chai;

const script = rewire("./uplink.js");
let positionSchema = null;
let lifecycleSchema = null;
const consume = script.__get__("consume");

function expectEmit(callback) {
  script.__set__({
    emit: callback,
  });
}


before((done) => {
  fs.readFile(
    `${__dirname  }/position.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      positionSchema = JSON.parse(fileContents);
      done();
    }
  );
});

before((done) => {
  fs.readFile(
    `${__dirname  }/lifecycle.schema.json`,
    "utf8",
    (err, fileContents) => {
      if (err) throw err;
      lifecycleSchema = JSON.parse(fileContents);
      done();
    }
  );
});

describe("Digital matter Oyster Uplink", () => {
  describe("consume()", () => {
    it("should decode the digital matter Oyster payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payload_hex: "53AB783C0421F98E940AB3",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "position") {
          assert.equal(value.data.latitude, 101.4541139);
          assert.equal(value.data.longitude, -189.6275708);
          assert.equal(value.data.inTrip, false);
          assert.equal(value.data.fixFailed, false);
          assert.equal(value.data.headingDeg, 208.125);
          assert.equal(value.data.speedKmph, 10);
          assert.equal(value.data.voltage, 4.48);

          validate(value.data, positionSchema, { throwError: true });
        }
      });

      consume(data);
    });
    it("should decode the digital matter Oyster payload, port 3", () => {
      const data = {
        data: {
          port: 3,
          payload_hex: "8BF3DC7B9438984278B85E",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "lifecycle") {
          assert.equal(value.data.type, "lifecycle");
          assert.equal(value.data.initialBatV, 5.1);
          assert.equal(value.data.txCount, 59136);
          assert.equal(value.data.tripCount, 194336);
          assert.equal(value.data.gpsSuccesses, 10464);
          assert.equal(value.data.gpsFails, 7232);
          assert.equal(value.data.aveGpsFixS, 96);
          assert.equal(value.data.aveGpsFailS, 133);
          assert.equal(value.data.aveGpsFreshenS, 120);
          assert.equal(value.data.wakeupsPerTrip, 56);
          assert.equal(value.data.uptimeWeeks, 189);

          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
