const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Pipiot levelSense uplink", () => {
  let extSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/ext.schema.json`).then((parsedSchema) => {
      extSchema = parsedSchema;
      done();
    });
  });

  let defaultSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Pipiot levelSense payload", () => {
      const data = {
        data: {
          payloadHex: "3000001060d701d219049d02",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.ultrasonicDistanceExt, 838);
        assert.equal(value.data.laserDistanceExt, 43);

        utils.validateSchema(value.data, extSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.laserReflectance, 119296);
        assert.equal(value.data.temperature, 25);
        assert.equal(value.data.temperatureF, 77);
        assert.equal(value.data.tiltAngle, 4);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
