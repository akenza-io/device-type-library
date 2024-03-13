const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab TRBG Uplink", () => {
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
    it("should decode Decentlab TRBG payload", () => {
      const data = {
        data: {
          payloadHex: "0202f8000300040258409a00000c54",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.soilMoistureAtDepth0, -0.39);
        assert.equal(value.data.soilTemperatureAtDepth0, 27);
        assert.equal(value.data.soilMoistureAtDepth1, -0.258);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 2.875);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 2896);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });

  it("should decode Decentlab TRBG payload", () => {
    const data = {
      data: {
        payloadHex: "0202f800020c54",
      },
    };

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "default");
      assert.equal(value.data.soilMoistureAtDepth0, -0.39);
      assert.equal(value.data.soilTemperatureAtDepth0, 27);
      assert.equal(value.data.soilMoistureAtDepth1, -0.258);
      assert.equal(value.data.soilTemperatureAtDepth1, 27.12);
      assert.equal(value.data.soilMoistureAtDepth2, -0.314);
      assert.equal(value.data.soilTemperatureAtDepth2, 27.06);
      assert.equal(value.data.soilMoistureAtDepth3, 0.752);
      assert.equal(value.data.soilTemperatureAtDepth3, 27.25);
      assert.equal(value.data.soilMoistureAtDepth4, 1.456);
      assert.equal(value.data.soilTemperatureAtDepth4, 27);
      assert.equal(value.data.soilMoistureAtDepth5, 4.152);
      assert.equal(value.data.soilTemperatureAtDepth5, 27.25);
      assert.equal(value.data.soilMoistureAtDepth6, -5);
      assert.equal(value.data.soilTemperatureAtDepth6, -327.68);
      assert.equal(value.data.soilMoistureAtDepth7, -5);
      assert.equal(value.data.soilTemperatureAtDepth7, -327.68);

      utils.validateSchema(value.data, defaultSchema, { throwError: true });
    });

    utils.expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");

      assert.equal(value.topic, "lifecycle");
      assert.equal(value.data.batteryVoltage, 2.875);
      assert.equal(value.data.protocolVersion, 2);
      assert.equal(value.data.deviceId, 2896);

      utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
    });

    consume(data);
  });
});
