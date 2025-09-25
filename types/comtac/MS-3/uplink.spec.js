const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Comtac LPN MS-3 Uplink", () => {
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

  describe("consume()", () => {
    it("should decode the Comtac LPN MS-3 payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex:
            "1300bc001f0100ff5ffecc03b10024fff2000dffc3016300177fffffff7fffffff0000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.light, 0);
        assert.equal(value.data.temperature, 25.6);
        assert.equal(value.data.temperatureF, 78.1);
        assert.equal(value.data.humidity, 31);
        assert.equal(value.data.accX, -0.161);
        assert.equal(value.data.accY, -0.308);
        assert.equal(value.data.accZ, 0.945);
        assert.equal(value.data.gyroX, 3.6);
        assert.equal(value.data.gyroY, -1.4);
        assert.equal(value.data.gyroZ, 1.3);
        assert.equal(value.data.magnX, -0.061);
        assert.equal(value.data.magnY, 0.355);
        assert.equal(value.data.magnZ, 0.023);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.rs485, false);
        assert.equal(value.data.gps, false);
        assert.equal(value.data.acc, true);
        assert.equal(value.data.mag, false);
        assert.equal(value.data.mic, false);
        assert.equal(value.data.bright, true);
        assert.equal(value.data.tempHum, true);

        assert.equal(value.data.txOnEvent, false);
        assert.equal(value.data.magActual, false);
        assert.equal(value.data.extCon, false);
        assert.equal(value.data.booster, false);
        assert.equal(value.data.extSupply, false);
        assert.equal(value.data.dip3, false);
        assert.equal(value.data.dip2, false);
        assert.equal(value.data.dip1, false);
        assert.equal(value.data.batteryVoltage, 2.88);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
