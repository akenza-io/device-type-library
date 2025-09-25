const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("WT201 Uplink", () => {
  let defaultSchema = null;
  let systemSchema = null;
  let wiresSchema = null;
  let planSchema = null;
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
      .loadSchema(`${__dirname}/wires.schema.json`)
      .then((parsedSchema) => {
        wiresSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/system.schema.json`)
      .then((parsedSchema) => {
        systemSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/plan.schema.json`)
      .then((parsedSchema) => {
        planSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode should decode the WT201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "036702010467A60005E70006E80007BC00",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.fanMode, "AUTO");
        assert.equal(value.data.fanStatus, "STANDBY");
        assert.equal(value.data.planEvent, "NOT_EXCECUTED");
        assert.equal(value.data.temperature, 25.8);
        assert.equal(value.data.temperatureTarget, 16.6);
        assert.equal(value.data.temperatureF, 78.4);
        assert.equal(value.data.temperatureTargetF, 61.9);
        assert.equal(value.data.temperatureControlMode, "HEAT");
        assert.equal(value.data.temperatureControlStatus, "STANDBY");

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the WT201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FFCB0D1101FFCA158004",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.deepEqual(value.data.temperatureControlModeEnabled, [
          "HEAT",
          "COOL",
          "AUTO",
        ]);
        assert.deepEqual(value.data.temperatureControlStatusEnabled, [
          "STAGE_1_HEAT",
          "AUX_HEAT",
          "STAGE_1_COOL",
        ]);

        utils.validateSchema(value.data, systemSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "wires");
        assert.equal(value.data.obMode, "HEAT");
        assert.deepEqual(value.data.wires, ['Y1', 'GH', 'OB', 'AUX']);

        utils.validateSchema(value.data, wiresSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the WT201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FFC900000000B302FFC9020101280000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "plan");

        assert.equal(value.data.index, 1);
        assert.equal(value.data.planEnabled, "DISABLED");
        assert.equal(value.data.time, "11:31");
        assert.equal(value.data.type, "WAKE");
        assert.deepEqual(value.data.weekRecycle, []);

        utils.validateSchema(value.data, planSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "plan");

        assert.equal(value.data.index, 2);
        assert.equal(value.data.planEnabled, "ENABLED");
        assert.equal(value.data.time, "0:00");
        assert.equal(value.data.type, "HOME");
        assert.deepEqual(value.data.weekRecycle, ["WED", "FRI"]);

        utils.validateSchema(value.data, planSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
