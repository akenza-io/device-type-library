const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab TP Uplink", () => {
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
    it("should decode the Decentlab TP payload", () => {
      const data = {
        data: {
          payloadHex:
            "023e3e00038abc8a928aa08a848ab38a898ac38aad8ab78a928aa1000000000000000000000afc",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperatureAtLevel0, 27.48);
        assert.equal(value.data.temperatureAtLevel0F, 81.5);
        assert.equal(value.data.temperatureAtLevel1, 27.06);
        assert.equal(value.data.temperatureAtLevel1F, 80.7);
        assert.equal(value.data.temperatureAtLevel10, 27.21);
        assert.equal(value.data.temperatureAtLevel10F, 81);
        assert.equal(value.data.temperatureAtLevel11, -327.68);
        assert.equal(value.data.temperatureAtLevel11F, -557.8);
        assert.equal(value.data.temperatureAtLevel12, -327.68);
        assert.equal(value.data.temperatureAtLevel12F, -557.8);
        assert.equal(value.data.temperatureAtLevel13, -327.68);
        assert.equal(value.data.temperatureAtLevel13F, -557.8);
        assert.equal(value.data.temperatureAtLevel14, -327.68);
        assert.equal(value.data.temperatureAtLevel14F, -557.8);
        assert.equal(value.data.temperatureAtLevel15, -327.68);
        assert.equal(value.data.temperatureAtLevel15F, -557.8);
        assert.equal(value.data.temperatureAtLevel2, 27.2);
        assert.equal(value.data.temperatureAtLevel2F, 81);
        assert.equal(value.data.temperatureAtLevel3, 26.92);
        assert.equal(value.data.temperatureAtLevel3F, 80.5);
        assert.equal(value.data.temperatureAtLevel4, 27.39);
        assert.equal(value.data.temperatureAtLevel4F, 81.3);
        assert.equal(value.data.temperatureAtLevel5, 26.97);
        assert.equal(value.data.temperatureAtLevel5F, 80.5);
        assert.equal(value.data.temperatureAtLevel6, 27.55);
        assert.equal(value.data.temperatureAtLevel6F, 81.6);
        assert.equal(value.data.temperatureAtLevel7, 27.33);
        assert.equal(value.data.temperatureAtLevel7F, 81.2);
        assert.equal(value.data.temperatureAtLevel8, 27.43);
        assert.equal(value.data.temperatureAtLevel8F, 81.4);
        assert.equal(value.data.temperatureAtLevel9, 27.06);
        assert.equal(value.data.temperatureAtLevel9F, 80.7);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.812);
        assert.equal(value.data.deviceId, 15934);
        assert.equal(value.data.protocolVersion, 2);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});