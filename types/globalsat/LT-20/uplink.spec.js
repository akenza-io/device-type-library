const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const utils = require("test-utils");

const assert = chai.assert;

describe("Globalsat LT-20 uplink", function () {
  let defaultSchema = null;
  let consume = null;
  before(function (done) {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(__dirname + "/default.schema.json")
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let lifeCycleSchema = null;
  before(function (done) {
    utils
      .loadSchema(__dirname + "/lifecycle.schema.json")
      .then((parsedSchema) => {
        lifeCycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", function () {
    it("should decode Globalsat LT-20 payload", function (done) {
      const data = {
        data: {
          port: 1,
          payload_hex: "80023032525AEFD2046400",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "lifecyle") {
          //assert.equal(value.data.batteryPercent, 100);
          validate(value.data, lifecycleSchema, { throwError: true });
        }
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic == "default") {
          assert.equal(value.data.longitude, 115.8162);
          assert.equal(value.data.latitude, -31.8965256);
          assert.equal(value.data.gpsFix, "Not fix");
          assert.equal(value.data.reportType, "Motion mode static report");
          validate(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
      done();
    });
  });
});
