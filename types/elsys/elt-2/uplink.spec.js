const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Elsys ELT-2 uplink", () => {
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
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let configurationSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/configuration.schema.json`)
      .then((parsedSchema) => {
        configurationSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Elsys ELT-2 payload", () => {
      const data = {
        data: {
          payloadHex: "0100e20218070e410cff5614000edd20",
          port: 5,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 22.6);
        assert.equal(value.data.humidity, 24);
        assert.equal(value.data.pressure, 974.112);
        assert.equal(value.data.externalTemperature1, -17);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.649);
        assert.equal(value.data.batteryLevel, 100);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode Elsys ELT-2 configuration payload", () => {
      const data = {
        data: {
          payloadHex:
            "3e570701080509010a000b050d000c0511021300000000140000012c15000000011600000001170000000118000000011d000000001e000000011f00000001200000000022000000002400000001250326002700f519fb00eb",
          port: 6,
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.ota, true);
        assert.equal(value.data.port, 5);
        assert.equal(value.data.mode, 1);
        assert.equal(value.data.ack, false);
        assert.equal(value.data.drDef, 5);
        assert.equal(value.data.drMin, 0);
        assert.equal(value.data.drMax, 5);
        assert.equal(value.data.pirCfg, 2);
        assert.deepEqual(value.data.accCfg, [0, 0, 0, 0]);
        assert.equal(value.data.splPer, 300);
        assert.equal(value.data.tempPer, 1);
        assert.equal(value.data.rhPer, 1);
        assert.equal(value.data.lightPer, 1);
        assert.equal(value.data.pirPer, 1);
        assert.equal(value.data.accPer, 0);
        assert.equal(value.data.vddPer, 1);
        assert.equal(value.data.sendPer, 1);
        assert.equal(value.data.lock, 0);
        assert.deepEqual(value.data.link, [0, 0, 0, 0]);
        assert.equal(value.data.soundPer, 1);
        assert.equal(value.data.plan, 3);
        assert.equal(value.data.subBand, 0);
        assert.equal(value.data.lbt, false);
        assert.equal(value.data.sensor, "ERS_SOUND");
        assert.equal(value.data.version, 235);

        utils.validateSchema(value.data, configurationSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
