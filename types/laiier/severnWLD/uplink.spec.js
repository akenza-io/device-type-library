const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Laiier severnWLD Uplink", () => {
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

  let startUpSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/start_up.schema.json`)
      .then((parsedSchema) => {
        startUpSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Laiier severnWLD startup payload", () => {
      const data = {
        data: {
          port: 100,
          payloadHex: "2319010600000272010000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "start_up");

        assert.equal(value.data.firmwareVersion, "1.0.0");
        assert.equal(value.data.serialNumber, 2529053791026676000);

        utils.validateSchema(value.data, startUpSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode Laiier severnWLD self test payload", () => {
      const data = {
        data: {
          port: 102,
          payloadHex: "0000fd023f18030168",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.criticalWetFlag, false);
        assert.equal(value.data.interval, 360);
        assert.equal(value.data.leakElectrode1, false);
        assert.equal(value.data.leakElectrode2, false);
        assert.equal(value.data.leakElectrode3, false);
        assert.equal(value.data.leakElectrode4, false);
        assert.equal(value.data.leakElectrode5, false);
        assert.equal(value.data.leakElectrode6, false);
        assert.equal(value.data.leakElectrode7, false);
        assert.equal(value.data.leakElectrode8, false);
        assert.equal(value.data.leakElectrode9, false);
        assert.equal(value.data.leakElectrode10, false);
        assert.equal(value.data.leakElectrode11, false);
        assert.equal(value.data.leakElectrode12, false);
        assert.equal(value.data.messageType, "SELF_TEST_MESSAGE");
        assert.equal(value.data.selfTestFailed, false);
        assert.equal(value.data.temperature, 24);
        assert.equal(value.data.wetnessThreshold, 3);

        utils.validateSchema(value.data, defaultSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
