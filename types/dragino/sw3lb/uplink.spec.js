const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Dragino SW3L Uplink", () => {
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
    it("should decode the Dragino SW3L report uplink", () => {
      const data = {
        device: {
          customFields: {
            transformation: 12,
          },
        },
        data: {
          payloadHex: "01000000c3000166ec3c7e",
          port: 2,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value.lastPulse, 195);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarm, false);
        assert.equal(value.data.calculateFlag, 0);
        assert.equal(value.data.relativePulse, 0);
        assert.equal(value.data.totalPulse, 195);
        assert.equal(value.data.currentWaterConsumption, 0);
        assert.equal(value.data.totalWaterConsumption, 16.3);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the Dragino SW3L report uplink", () => {
      const data = {
        state: {
          lastPulse: 120,
        },
        data: {
          payloadHex: "01000000c3000166ec3c7e",
          port: 2,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value.lastPulse, 195);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.alarm, false);
        assert.equal(value.data.calculateFlag, 0);
        assert.equal(value.data.relativePulse, 75);
        assert.equal(value.data.totalPulse, 195);
        assert.equal(value.data.currentWaterConsumption, 0.2);
        assert.equal(value.data.totalWaterConsumption, 0.4);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
