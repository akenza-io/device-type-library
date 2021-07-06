const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;
describe("Astraled Air Quality Luminary V0.02 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });
  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });
  describe("consume()", () => {
    it("should decode the Astraled Air Quality Luminary V0.02 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "042a0000803f042b54ca2d41022cfa000223110001320302091109020a4601020b3d01020c9802010e00",
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.actPwr, 1);
        assert.equal(value.data.energy, 10.861896514892578);
        assert.equal(value.data.iaqStateInt, 0);
        assert.equal(value.data.sensorAmbientLight, 250);

        validate(value.data, lifecycleSchema, { throwError: true });
      });
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.lightState, 17);
        assert.equal(value.data.temperature, 23.21);
        assert.equal(value.data.humidity, 32.6);
        assert.equal(value.data.voc, 317);
        assert.equal(value.data.co2, 664);
        validate(value.data, defaultSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
