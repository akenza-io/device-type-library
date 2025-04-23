const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("WS558 Uplink", () => {
  let defaultSchema = null;
  let switchSchema = null;
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

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/switch.schema.json`)
      .then((parsedSchema) => {
        switchSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the WS558 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0831000105816407C902000374B208068301000000048001000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "switch");
        assert.equal(value.data.switch1, true);
        assert.equal(value.data.switch2, false);
        assert.equal(value.data.switch3, false);
        assert.equal(value.data.switch4, false);
        assert.equal(value.data.switch5, false);
        assert.equal(value.data.switch6, false);
        assert.equal(value.data.switch7, false);
        assert.equal(value.data.switch8, false);

        utils.validateSchema(value.data, switchSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.voltage, 222.6);
        assert.equal(value.data.activePower, 1);
        assert.equal(value.data.powerFactor, 100);
        assert.equal(value.data.powerConsumption, 1);
        assert.equal(value.data.totalCurrent, 2);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
