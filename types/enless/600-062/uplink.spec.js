const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;
describe("Enless 600-062 Uplink Uplink", () => {
  describe("consume()", () => {
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
      const script = rewire("./uplink.js");
      consume = utils.init(script);
      utils
        .loadSchema(`${__dirname}/lifecycle.schema.json`)
        .then((parsedSchema) => {
          lifecycleSchema = parsedSchema;
          done();
        });
    });

    let alarmSchema = null;
    before((done) => {
      const script = rewire("./uplink.js");
      consume = utils.init(script);
      utils
        .loadSchema(`${__dirname}/alarm.schema.json`)
        .then((parsedSchema) => {
          alarmSchema = parsedSchema;
          done();
        });
    });

    it("should decode MCF-LW12CO2E climate payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "0144bf22870c00d7000001dd000000000001000000000000000000000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.fwVersion, 12);
        assert.equal(value.data.id, 83135);
        assert.equal(value.data.seqCounter, 135);
        assert.equal(value.data.type, 34);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 21.5);
        assert.closeTo(value.data.temperatureF, 70.7, 0.1);
        assert.equal(value.data.humidity, 47.7);
        assert.equal(value.data.luminosity, 0);
        assert.equal(value.data.movementDetected, false);
        assert.equal(value.data.msgType, "NORMAL");
        assert.equal(value.data.pirCount, 1);
        assert.equal(value.data.rbe, false);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.humidityLow, false);
        assert.equal(value.data.motionGuard, false);
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.temperatureLow, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
