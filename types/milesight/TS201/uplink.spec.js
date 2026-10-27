import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight TS201 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight TS201 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "93673401640002",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 30.8);
        assert.equal(data.temperatureMutation, 10);
        assert.equal(data.temperatureAlarm, "MUTATION");
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS201 history payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CEC79AFA6402BDFF",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, -6.7);
        assert.equal(data.eventType, "ALARM");
        assert.equal(data.readStatus, "SUCCESS");
      });

      consume(data);
    });
  });
});
