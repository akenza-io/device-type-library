const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Comtac Cluey Uplink", () => {
  let digitalInputsSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/digital_inputs.schema.json`)
      .then((parsedSchema) => {
        digitalInputsSchema = parsedSchema;
        done();
      });
  });

  let eventSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/event.schema.json`).then((parsedSchema) => {
      eventSchema = parsedSchema;
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

  let pointInfoSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/point_info.schema.json`)
      .then((parsedSchema) => {
        pointInfoSchema = parsedSchema;
        done();
      });
  });

  let analogInput5Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/analog_input_5.schema.json`)
      .then((parsedSchema) => {
        analogInput5Schema = parsedSchema;
        done();
      });
  });

  let analogInput6Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/analog_input_6.schema.json`)
      .then((parsedSchema) => {
        analogInput6Schema = parsedSchema;
        done();
      });
  });

  let analogInput7Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/analog_input_7.schema.json`)
      .then((parsedSchema) => {
        analogInput7Schema = parsedSchema;
        done();
      });
  });

  let analogInput8Schema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/analog_input_8.schema.json`)
      .then((parsedSchema) => {
        analogInput8Schema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Comtac Cluey AI_DATA payload", () => {
      const data = {
        data: {
          port: 23,
          payloadHex: "1103040163d033a755801ee30000568900000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "analog_input_5");
        assert.equal(value.data.cyclic, true);
        assert.equal(value.data.event, false);
        assert.equal(value.data.interrogation, false);
        assert.equal(value.data.invalid, false);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.limit1, false);
        assert.equal(value.data.limit2, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.value, 7907);

        utils.validateSchema(value.data, analogInput5Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "analog_input_6");
        assert.equal(value.data.cyclic, true);
        assert.equal(value.data.event, false);
        assert.equal(value.data.interrogation, false);
        assert.equal(value.data.invalid, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.limit1, true);
        assert.equal(value.data.limit2, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.value, 0);

        utils.validateSchema(value.data, analogInput6Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.eventType, "AI_DATA");

        utils.validateSchema(value.data, eventSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryPowered, false);
        assert.equal(value.data.bufferOverflow, false);
        assert.equal(value.data.configurationError, false);
        assert.equal(value.data.confirmationTimeout, false);
        assert.equal(value.data.deviceRestarted, false);
        assert.equal(value.data.lowSupplyVoltage, false);
        assert.equal(value.data.timeSynced, true);
        assert.equal(value.data.txCreditsConsumed, false);

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Comtac Cluey point_info payload", () => {
      const data = {
        data: {
          port: 20,
          payloadHex:
            "100128df5fee66011141000012410000134100001441000015410000164100001741000018410000",
        },
      };
      const script = rewire("./uplink.js");
      consume = utils.init(script);

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 1);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 2);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 3);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 4);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 5);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 6);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 7);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "log");
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "point_info");
        assert.equal(value.data.blocked, false);
        assert.equal(value.data.cyclic, false);
        assert.equal(value.data.event, false);
        assert.equal(value.data.id, 8);
        assert.equal(value.data.interrogation, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.type, "SINGLE_POINT_INFO");

        utils.validateSchema(value.data, pointInfoSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.eventType, "DI_DATA");

        utils.validateSchema(value.data, eventSchema, {
          throwError: true,
        });
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

    it("should decode the Comtac Cluey interval data payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "110304bc64c2376680000300000000000000000000000000000000000000005588000000568800000057880000005888000000",
        },
      };
      const script = rewire("./uplink.js");
      consume = utils.init(script);

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "digital_inputs");
        assert.equal(value.data.cyclic, true);
        assert.equal(value.data.event, false);
        assert.equal(value.data.interrogation, false);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.digitalInput1, true);
        assert.equal(value.data.digitalInput2, true);
        assert.equal(value.data.digitalInput3, false);
        assert.equal(value.data.digitalInput4, false);
        assert.equal(value.data.digitalInput5, false);
        assert.equal(value.data.digitalInput6, false);
        assert.equal(value.data.digitalInput7, false);
        assert.equal(value.data.digitalInput8, false);
        assert.equal(value.data.digitalInput9, false);
        assert.equal(value.data.digitalInput10, false);
        assert.equal(value.data.digitalInput11, false);
        assert.equal(value.data.digitalInput12, false);
        assert.equal(value.data.digitalInput13, false);
        assert.equal(value.data.digitalInput14, false);
        assert.equal(value.data.digitalInput15, false);
        assert.equal(value.data.digitalInput16, false);

        utils.validateSchema(value.data, digitalInputsSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "analog_input_5");
        assert.equal(value.data.cyclic, true);
        assert.equal(value.data.event, false);
        assert.equal(value.data.interrogation, false);
        assert.equal(value.data.invalid, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.limit1, false);
        assert.equal(value.data.limit2, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.value, 0);

        utils.validateSchema(value.data, analogInput5Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "analog_input_6");
        assert.equal(value.data.cyclic, true);
        assert.equal(value.data.event, false);
        assert.equal(value.data.interrogation, false);
        assert.equal(value.data.invalid, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.limit1, false);
        assert.equal(value.data.limit2, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.value, 0);

        utils.validateSchema(value.data, analogInput6Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "analog_input_7");
        assert.equal(value.data.cyclic, true);
        assert.equal(value.data.event, false);
        assert.equal(value.data.interrogation, false);
        assert.equal(value.data.invalid, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.limit1, false);
        assert.equal(value.data.limit2, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.value, 0);

        utils.validateSchema(value.data, analogInput7Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "analog_input_8");
        assert.equal(value.data.cyclic, true);
        assert.equal(value.data.event, false);
        assert.equal(value.data.interrogation, false);
        assert.equal(value.data.invalid, true);
        assert.equal(value.data.limit, false);
        assert.equal(value.data.limit1, false);
        assert.equal(value.data.limit2, false);
        assert.equal(value.data.overflow, false);
        assert.equal(value.data.value, 0);

        utils.validateSchema(value.data, analogInput8Schema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.eventType, "FIXED_DATA");

        utils.validateSchema(value.data, eventSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 74);
        assert.equal(value.data.batteryPowered, false);
        assert.equal(value.data.bufferOverflow, false);
        assert.equal(value.data.configurationError, false);
        assert.equal(value.data.confirmationTimeout, false);
        assert.equal(value.data.deviceRestarted, false);
        assert.equal(value.data.lowSupplyVoltage, false);
        assert.equal(value.data.timeSynced, true);
        assert.equal(value.data.txCreditsConsumed, false);

        utils.validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
