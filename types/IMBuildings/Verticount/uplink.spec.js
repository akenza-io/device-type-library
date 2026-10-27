import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("IMBuilding Verticount counter", () => {
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
    it("should decode the IMBuilding Verticount standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "02060004a30b0114930d00016f00000000000000000002",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.counterA, 0);
        assert.equal(data.counterB, 0);
      });

      expectSample("total_counter", totalCounterSchema, (data) => {
        assert.equal(data.totalCounterA, 0);
        assert.equal(data.totalCounterB, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.deviceStatus, 0);
        assert.equal(data.payloadCounter, 2);
        assert.equal(data.sensorStatus, 0);
        assert.equal(data.batteryVoltage, 3.67);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
