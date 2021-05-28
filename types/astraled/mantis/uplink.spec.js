const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const axios = require("axios");
const fs = require("fs");
const Ajv = require("ajv");

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

describe("Astraled Mantis Uplink", () => {
  describe("consume()", () => {
    it("should decode Astraled Mantis payload", () => {
      const data = {
        port: 1,
        data: {
          payload_hex: "042a0000803f042b54ca2d41022cfa000223110001320302091109020a4601020b3d01020c9802010e00",
        },
      };

      expectEmit((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.act_pwr, 1);
          assert.equal(value.data.energy, 10.861896514892578);
          assert.equal(value.data.iaq_state_int, 0);
          assert.equal(value.data.sensor_ambient_light, 250);

          validate(value.data, defaultSchema, { throwError: true });
        }

        if (value.topic === "lifecycle") {
        assert.equal(value.data.lightState, 17);
        assert.equal(value.data.temperature, 23.21);
        assert.equal(value.data.humidity, 32.6);
        assert.equal(value.data.voc, 317);
        assert.equal(value.data.co2, 664);

          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});