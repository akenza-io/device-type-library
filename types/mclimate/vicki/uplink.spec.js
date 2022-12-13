const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("MClimate Vicky uplink", () => {
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

  let mclimateSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/mclimate.schema.json`)
      .then((parsedSchema) => {
        mclimateSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode MClimate Vicky payload", () => {
      const data = {
        data: {
          payloadHex: "011D5A78FA2C01F080"
        },
        device: {
          deviceId: "70B3D52DD300550E"
        },
        uplinkMetrics: {
          timestamp: 1670849361.1912086,
          port: 2,
          frameCountUp: 6,
          rssi: -119,
          snr: 2,
          sf: 12
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.targetTemperature, 29);
        assert.equal(value.data.sensorTemperature, 18.01);
        assert.equal(value.data.relativeHumidity, 46.88);
        assert.equal(value.data.motorRange, 300);
        assert.equal(value.data.motorPosition, 250);
        assert.equal(value.data.openWindow, false);
        assert.equal(value.data.childLock, true);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.5);
        assert.equal(value.data.highMotorConsumption, false);
        assert.equal(value.data.lowMotorConsumption, false);
        assert.equal(value.data.brokenSensor, false);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mclimate");
        assert.equal(value.data.deviceId, "70B3D52DD300550E");
        assert.equal(value.data.payloadHex, "011D5A78FA2C01F080");
        assert.equal(value.data.timestamp, 1670849361.1912086);
        assert.equal(value.data.port, 2);
        assert.equal(value.data.frameCountUp, 6);
        assert.equal(value.data.rssi, -119);
        assert.equal(value.data.snr, 2);
        assert.equal(value.data.spreadingFactor, 12);

        utils.validateSchema(value.data, mclimateSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
