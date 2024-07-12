const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("IMBuilding People counter", () => {
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

  let totalCounterSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/totalCounter.schema.json`)
      .then((parsedSchema) => {
        totalCounterSchema = parsedSchema;
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
    it("should decode the IMBuilding People counter standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "02060004A30B00F6B5690800F80003000220060305E661",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterA, 3);
        assert.equal(value.data.counterB, 2);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "totalCounter");
        assert.equal(value.data.totalCounterA, 1539);
        assert.equal(value.data.totalCounterB, 1510);

        utils.validateSchema(value.data, totalCounterSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.deviceStatus, "BATTERY_NOT_FULL");
        assert.equal(value.data.payloadCounter, 97);
        assert.equal(value.data.sensorStatus, "RECEIVER_LOW_BATTERY");
        assert.equal(value.data.batteryVoltage, 2.48);
        assert.equal(value.data.batteryLevel, 42);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the IMBuilding People NB-IOT payload", () => {
      const data = {
        data: {
          reports: [
            {
              serialNumber: "IMEI:861518040266396",
              timestamp: 1675420474870,
              subscriptionId: "f05b9df9-76a9-4247-b3f8-b710ee593667",
              resourcePath: "uplinkMsg/0/data",
              value: "0204e8eb1b4f131d00010b8f202302031035000000000000",
              customAttributes: {
                device_protocol: "udp",
              },
            },
          ],
          registrations: [],
          deregistrations: [],
          updates: [],
          expirations: [],
          responses: [],
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.counterA, 0);
        assert.equal(value.data.counterB, 0);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.deviceID, "23223527791929");
        assert.equal(value.data.deviceStatus, "NO_STATUS");
        assert.equal(value.data.rssi, -113);
        assert.equal(value.data.sensorStatus, "RESERVED");
        assert.equal(value.data.batteryVoltage, 2.67);
        assert.equal(value.data.batteryLevel, 63);

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
