const chai = require("chai");
const validate = require("jsonschema").validate;
const rewire = require("rewire");
const utils = require("test-utils");

const assert = chai.assert;

describe("Astraled Air Quality Luminary V0.02 Uplink", function () {
  let schema = null;
  let consume = null;
  before(function (done) {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(__dirname + "/default.schema.json")
      .then((parsedSchema) => {
        schema = parsedSchema;
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
    it("should decode the Astraled Air Quality Luminary V0.02 payload", function (done) {
      const data = {
        data: {
          port: 1,
          flags: {
            AK_SF: "7",
            AK_SNR: "9",
            AK_Port: "1",
            AK_RSSI: "-46",
            AK_FrameCntUp: "20982",
            AK_LastMsgTime: "2021-02-16T09:09:14.614Z",
            AK_NrGwInRange: "1",
          },
          payload_hex:
            "042a0000803f042b54ca2d41022cfa000223110001320302091109020a4601020b3d01020c9802010e00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");

        assert.equal(value.data.rssi, "-46");
        assert.equal(value.data.act_pwr, 1);
        //TODO this should most likely be battery?
        assert.equal(value.data.energy, 10.861896514892578);

        //TODO these two props should most likely be in the default topic
        assert.equal(value.data.iaq_state_int, 0);
        assert.equal(value.data.sensor_ambient_light, 250);

        validate(value.data, lifeCycleSchema, { throwError: true });
      });
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");

        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");

        assert.equal(value.data.light_state, 17);
        assert.equal(value.data.temperature, 23.21);
        assert.equal(value.data.humidity, 32.6);
        assert.equal(value.data.voc, 317);
        assert.equal(value.data.co2, 664);

        validate(value.data, schema, { throwError: true });
      });

      consume(data);
      done();
    });
  });
});
