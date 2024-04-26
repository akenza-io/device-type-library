const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Milesight TS301 Uplink", () => {
  let consume = null;

  let alarmSchema = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/alarm.schema.json`).then((parsedSchema) => {
      alarmSchema = parsedSchema;
      done();
    });
  });

  let climateSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/climate.schema.json`)
      .then((parsedSchema) => {
        climateSchema = parsedSchema;
        done();
      });
  });

  let magnetSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/magnet.schema.json`).then((parsedSchema) => {
      magnetSchema = parsedSchema;
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
    it("should decode should decode the Milesight TS301 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0175640367F100040001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperatureChannel1, 24.1);
        assert.equal(value.data.temperatureChannel2, null);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "magnet");
        assert.equal(value.data.magnetChannel1, null);
        assert.equal(value.data.magnetChannel2, false);

        utils.validateSchema(value.data, magnetSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS301 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0175640367FB0004670101",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperatureChannel1, 25.1);
        assert.equal(value.data.temperatureChannel2, 25.7);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS301 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403672701836727010004670801",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperatureChannel1, 29.5);
        assert.equal(value.data.temperatureChannel2, 26.4);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.alarmChannel1, "THRESHOLD_RELEASE");
        assert.equal(value.data.alarmChannel2, null); // Null is not definedable per enum

        // utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS301 history payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CEC79AFA6444BDFFF600",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperatureChannel1, -6.7);
        assert.equal(value.data.temperatureChannel2, 24.6);

        utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
