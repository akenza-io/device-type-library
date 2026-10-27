import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("IMBuilding Office counter occupancy", () => {
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
    it("should decode the IMBuilding Office occupancy counter standart payload", () => {
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
        assert.equal(data.deviceStatus, 8);
        assert.equal(data.payloadCounter, 97);
        assert.equal(data.sensorStatus, 32);
        assert.equal(data.batteryVoltage, 2.48);
      });

      consume(data);
    });
  });
});
