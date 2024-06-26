const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;
describe("Landis & Gyr WZU Uplink", () => {
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
    it("should decode Landis & Gyr WZU default payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "000c06674847020c14528275030b2d0603000b3b0006000a5a15110a5e67060c782897486602fd170000",
        },
      };
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.energyUnit, "KWH");
        assert.equal(value.data.energy, 2474867);
        assert.equal(value.data.volume, 37582.52);
        assert.equal(value.data.power, 30.6);
        assert.equal(value.data.flow, 0.6);
        assert.equal(value.data.flowTemp, 111.5);
        assert.equal(value.data.backFlowTemp, 66.7);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.header, "STANDARD");
        assert.equal(value.data.serialID, 66489728);
        assert.equal(value.data.errFlags, "000017");
        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
