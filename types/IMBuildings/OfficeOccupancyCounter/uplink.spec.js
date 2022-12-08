const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("IMBuilding Office counter occupancy", () => {
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

  let totalCounterSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/totalCounter.schema.json`)
      .then((parsedSchema) => {
        totalCounterSchema = parsedSchema;
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
    it("should decode the IMBuilding Office occupancy counter standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "02060004A30B00F6B5690800F80003000220060305E661",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterA, 3);
        assert.equal(value.data.counterB, 2);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "totalCounter");
        assert.equal(value.data.totalCounterA, 1539);
        assert.equal(value.data.totalCounterB, 1510);

        utils.validateSchema(value.data, totalCounterSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.deviceStatus, 8);
        assert.equal(value.data.payloadCounter, 97);
        assert.equal(value.data.sensorStatus, 32);
        assert.equal(value.data.voltage, 2.48);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
