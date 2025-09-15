const chai = require("chai");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Transmitter 600-052", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let alarmSchema = null;
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
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  before((done) => {
    utils
      .loadSchema(`${__dirname}/alarm.schema.json`)
      .then((parsedSchema) => {
        alarmSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the 600-052 periodic payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "00200420001200fe00000208000000000000000000000000000000000200",
        },
      };

      // --- Lifecycle ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.id, 8196);
        assert.equal(value.data.type, 32);
        assert.equal(value.data.seqCounter, 0);
        assert.equal(value.data.fwVersion, 18);
        assert.equal(value.data.batteryLevel, 100); // bits 3-2 → 00 (512 >> 2)

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      // --- Default ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.closeTo(value.data.temperature, 25.4, 0.1);
        assert.equal(value.data.humidity, 52, 0.1);
        assert.equal(value.data.msg_type, "normal");
        assert.equal(value.data.rbe, true);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      // --- Alarm ---
      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "alarm");
        assert.equal(value.data.temperatureHigh, false);
        assert.equal(value.data.temperatureLow, false);
        assert.equal(value.data.humidityHigh, false);
        assert.equal(value.data.humidityLow, false);
        assert.equal(value.data.motionGuard, false);

        utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
