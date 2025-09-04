const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Should decode the TG563A uplinks", () => {
  let configSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/config.schema.json`).then((parsedSchema) => {
      configSchema = parsedSchema;
      done();
    });
  });

  let defaultSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
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
    it("Should decode the HKT Door Sensor Version uplinks", () => {
      const data = {
        data: {
          payloadHex: "0f7e1c0300ce300200009e32d732f11400003400000000160000000009000000151d05",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "config");
        assert.equal(value.data.longTelegramEnabled, true);
        assert.equal(value.data.majorFaultsAlertEnabled, true);
        assert.equal(value.data.minorFaultsAlertEnabled, true);
        assert.equal(value.data.periodicity, 24);
        assert.equal(value.data.smokeAlertEnabled, true);

        utils.validateSchema(value.data, configSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.batteryFault, false);
        assert.equal(value.data.aacFault, false);
        assert.equal(value.data.aacInactive, false);
        assert.equal(value.data.dayMode, true);
        assert.equal(value.data.foulingSmokeFault, false);
        assert.equal(value.data.frameType, "LONG_PERIODIC_TELEGRAM");
        assert.equal(value.data.hwIrAntimaskFault, false);
        assert.equal(value.data.hwUsAntimaskFault, false);
        assert.equal(value.data.irAntimask, false);
        assert.equal(value.data.mounted, true);
        assert.equal(value.data.smokeAlarm, false);
        assert.equal(value.data.temperature, 28);
        assert.equal(value.data.tempOutOfRange, false);
        assert.equal(value.data.mounted, true);
        assert.equal(value.data.tooLongUnmounted, false);
        assert.equal(value.data.usAntimask, false);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.06);
        assert.equal(value.data.installationDate, '2053-12-50');
        assert.equal(value.data.productionDate, '2039-08-50');
        assert.equal(value.data.serialNumber, "00000230");
        assert.equal(value.data.version, 0);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
