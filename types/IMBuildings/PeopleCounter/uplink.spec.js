import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("IMBuilding People counter", () => {
  let defaultSchema = null;
  let consume = null;
  let totalCounterSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    totalCounterSchema = loadSchema(`${import.meta.dirname}/total_counter.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the IMBuilding People counter standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "02060004A30B00F6B5690800F80003000220060305E661",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.counterA, 3);
        assert.equal(data.counterB, 2);
      });

      expectSample("total_counter", totalCounterSchema, (data) => {
        assert.equal(data.totalCounterA, 1539);
        assert.equal(data.totalCounterB, 1510);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.deviceStatus, "BATTERY_NOT_FULL");
        assert.equal(data.payloadCounter, 97);
        assert.equal(data.sensorStatus, "RECEIVER_LOW_BATTERY");
        assert.equal(data.batteryVoltage, 2.48);
        assert.equal(data.batteryLevel, 42);
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

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.counterA, 0);
        assert.equal(data.counterB, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.deviceID, "23223527791929");
        assert.equal(data.deviceStatus, "NO_STATUS");
        assert.equal(data.rssi, -113);
        assert.equal(data.sensorStatus, "RESERVED");
        assert.equal(data.batteryVoltage, 2.67);
        assert.equal(data.batteryLevel, 63);
      });

      consume(data);
    });
  });
});
