import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Tektelic Smart Room Base Sensor Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let defaultSchema = null;
  let reedSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    reedSchema = loadSchema(`${import.meta.dirname}/reed.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Tektelic Smart Room Base Sensor standart payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "036700fb04683600ff013f",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.19);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 25.1);
        assert.equal(data.humidity, 27);
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room Base Sensor reed payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "01000008040001",
        },
      };

      expectSample("reed", reedSchema, (data) => {
        assert.equal(data.reedCount, 1);
        assert.equal(data.open, false);
      });

      consume(data);
    });

    it("should decode the Tektelic Smart Room Base Sensor reed payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "0100ff08040001",
        },
      };

      expectSample("reed", reedSchema, (data) => {
        assert.equal(data.reedCount, 1);
        assert.equal(data.open, true);
      });

      consume(data);
    });
  });
});
