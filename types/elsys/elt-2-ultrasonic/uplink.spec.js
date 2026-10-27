import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Elsys ELT-2 Ultrasonic uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Elsys ELT-2 Ultrasonic payload", () => {
      const data = {
        data: {
          port: 5,
          payloadHex: "0100dd022b070e2e0e012c14000eb751",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance, 300);
        assert.equal(data.temperature, 22.1);
        assert.equal(data.humidity, 43);
        assert.equal(data.pressure, 964.433);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.63);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
