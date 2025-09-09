const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("DS3604 Uplink", () => {
  let templateSchema = null;
  let lifecycleSchema = null;
  let buttonSchema = null;

  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/template.schema.json`)
      .then((parsedSchema) => {
        templateSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });


  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/button.schema.json`)
      .then((parsedSchema) => {
        buttonSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the DS3604 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "017564FB0100054D696C6573FB010A0568656C6C6F",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "template");
        assert.equal(value.data.qrCode, "hello");
        assert.equal(value.data.templateId, 1);
        assert.equal(value.data.text1, "Miles");

        utils.validateSchema(value.data, templateSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the DS3604 button payload", () => {
      const data = {
        data: {
          "payloadHex": "ff2e00ff7301ff2e00ff7301ff2e00ff7301",
          "port": 85
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "template");
        assert.equal(value.data.templateId, 2);

        utils.validateSchema(value.data, templateSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "button");
        assert.equal(value.data.button, "SINGLE_CLICK");
        assert.equal(value.data.numericButton, 1);

        utils.validateSchema(value.data, buttonSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
