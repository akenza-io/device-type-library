const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Adeunis Pulse", () => {
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
    it("should decode the Adeunis Pulse standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "5A6700000127000100020003000414ABA3E9",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.frameCounter, 3);
        assert.equal(value.data.hardwareError, false);
        assert.equal(value.data.lowBattery, true);
        assert.equal(value.data.configurationDone, true);
        assert.equal(value.data.timestamp, true);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterValue, 295);
        assert.equal(value.data.counterValueT1, 294);
        assert.equal(value.data.counterValueT2, 292);
        assert.equal(value.data.counterValueT3, 289);
        assert.equal(value.data.counterValueT4, 285);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "extra");
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the Adeunis Pulse config payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "100001000239012C57003C27107530000A0000000300050103060A0D",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.frameCounter, 0);
        assert.equal(value.data.hardwareError, false);
        assert.equal(value.data.lowBattery, false);
        assert.equal(value.data.configurationDone, false);
        assert.equal(value.data.timestamp, false);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "extra");
      });

      consume(data);
    });
  });
});
