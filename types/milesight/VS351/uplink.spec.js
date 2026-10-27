import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Milesight VS351 Uplink", () => {
  let peopleFlowSchema = null;
  let consume = null;
  let climateSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    peopleFlowSchema = loadSchema(`${import.meta.dirname}/people_flow.schema.json`);
    climateSchema = loadSchema(`${import.meta.dirname}/climate.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight VS351 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "84CC011108110185CCE803E90301",
        },
      };

      expectSample("people_flow", peopleFlowSchema, (data) => {
        assert.equal(data.periodicCountAlarm, "THRESHOLD_ALARM");
        assert.equal(data.periodicCountIn, 1000);
        assert.equal(data.periodicCountOut, 1001);
        assert.equal(data.totalCountAlarm, "THRESHOLD_ALARM");
        assert.equal(data.totalCountIn, 4353);
        assert.equal(data.totalCountOut, 4360);
      });

      consume(data);
    });

    it("should decode should decode the Milesight VS350 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "8367360101",
        },
      };

      expectSample("climate", climateSchema, (data) => {
        assert.equal(data.temperatureAlarm, "THRESHOLD_ALARM");
        assert.equal(data.temperature, 31);
      });

      consume(data);
    });
  });
});
