const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Comtac Cluey KM Uplink", () => {
  let digitalSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/digital.schema.json`)
      .then((parsedSchema) => {
        digitalSchema = parsedSchema;
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
    it("should decode the Comtac Cluey KM payload", () => {
      const data = {
        data: {
          port: 20,
          payloadHex:
            "100128df5fee66011141000012410000134100001441000015410000164100001741000018410000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 1);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 2);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 3);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 4);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 5);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 6);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 7);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.inputNr, 8);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.state, 1);

        utils.validateSchema(value.data, digitalSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 88);
        assert.equal(value.data.batteryPowered, true);
        assert.equal(value.data.bufferOverflow, false);
        assert.equal(value.data.configurationError, false);
        assert.equal(value.data.confirmationTimeout, false);
        assert.equal(value.data.deviceRestarted, true);
        assert.equal(value.data.lowSupplyVoltage, false);
        assert.equal(value.data.timeSynced, false);
        assert.equal(value.data.txCreditsConsumed, false);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
