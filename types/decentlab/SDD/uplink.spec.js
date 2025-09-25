const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab SDD Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    done();
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Decentlab SDD payload", () => {
      const data = {
        data: {
          payloadHex:
            "0243e300058000800080008000800080008741877b8749876c876c876600000000000000000000014a09e3",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.moistureAtLevel0, 0);
        assert.equal(value.data.moistureAtLevel1, 0);
        assert.equal(value.data.moistureAtLevel2, 0);
        assert.equal(value.data.moistureAtLevel3, 0);
        assert.equal(value.data.moistureAtLevel4, 0);
        assert.equal(value.data.moistureAtLevel5, 0);
        assert.equal(value.data.salinityAtLevel0, -100);
        assert.equal(value.data.salinityAtLevel1, -100);
        assert.equal(value.data.salinityAtLevel2, -100);
        assert.equal(value.data.salinityAtLevel3, -100);
        assert.equal(value.data.salinityAtLevel4, -100);
        assert.equal(value.data.salinityAtLevel5, 230);
        assert.equal(value.data.temperatureAtLevel0, 18.57);
         assert.equal(value.data.temperatureAtLevel0F, 65.4);
        assert.equal(value.data.temperatureAtLevel1, 19.15);
         assert.equal(value.data.temperatureAtLevel1F, 66.5);
        assert.equal(value.data.temperatureAtLevel2, 18.65);
         assert.equal(value.data.temperatureAtLevel2F, 65.6);
        assert.equal(value.data.temperatureAtLevel3, 19);
         assert.equal(value.data.temperatureAtLevel3F, 66.2);
        assert.equal(value.data.temperatureAtLevel4, 19);
         assert.equal(value.data.temperatureAtLevel4F, 66.2);
        assert.equal(value.data.temperatureAtLevel5, 18.94);
         assert.equal(value.data.temperatureAtLevel5F, 66.1);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.531);
        assert.equal(value.data.deviceId, 17379);
        assert.equal(value.data.protocolVersion, 2);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});