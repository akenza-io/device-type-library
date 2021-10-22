const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Oxon Buttonboard Uplink", () => {
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
    it("should decode the Oxon Buttonboard payload", () => {
      const data = {
        data: {
          payloadHex: "31040000011c6418fe75014cf89eaf330001500128",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.hbIRQ, false);
        assert.equal(value.data.accIRQ, false);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.appMode, 1);

        validate(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.longPressed, false);
        assert.equal(value.data.button1, false);
        assert.equal(value.data.button2, false);
        assert.equal(value.data.button3, true);
        assert.equal(value.data.button4, false);
        assert.equal(value.data.button5, false);
        assert.equal(value.data.button6, false);

        assert.equal(value.data.button1Enabled, false);
        assert.equal(value.data.button2Enabled, false);
        assert.equal(value.data.button3Enabled, true);
        assert.equal(value.data.button4Enabled, true);
        assert.equal(value.data.button5Enabled, true);
        assert.equal(value.data.button6Enabled, false);

        assert.equal(value.data.accX, -0.096);
        assert.equal(value.data.accY, 0.081);
        assert.equal(value.data.accZ, -0.461);

        validate(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
