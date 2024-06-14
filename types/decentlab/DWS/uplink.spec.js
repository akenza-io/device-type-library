const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Decentlab DWS Uplink", () => {
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
    it("should decode Decentlab DWS payload & init state", () => {
      const data = {
        state: {},
        device: {
          customFields: {
            force: 9.8067,
            underLoad: 0.0000000475,
            strain: 0.066,
          },
        },
        data: {
          payloadHex: "0203d400033bf67fff3bf60c60",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.frequency, 15350.47);
        assert.equal(value.data.weight, 11.26);
        assert.equal(value.data.weightKg, 0.01126);
        assert.equal(value.data.incrementGram, 0);
        assert.equal(value.data.incrementKg, 0);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.168);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 980);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.state.lastWeighting, 11.26);
      });

      consume(data);
    });

    it("should decode Decentlab DWS payload & give out increment", () => {
      const data = {
        state: { lastWeighting: 5 },
        device: {
          customFields: {
            force: 9.8067,
            underLoad: 0.0000000475,
            strain: 0.066,
          },
        },
        data: {
          payloadHex: "0203d400033bf67fff3bf60c60",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.frequency, 15350.47);
        assert.equal(value.data.weight, 11.26);
        assert.equal(value.data.weightKg, 0.01126);
        assert.equal(value.data.incrementGram, 6.26);
        assert.equal(value.data.incrementKg, 0.006259999999999999);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.168);
        assert.equal(value.data.protocolVersion, 2);
        assert.equal(value.data.deviceId, 980);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.state.lastWeighting, 11.26);
      });

      consume(data);
    });
  });
});
