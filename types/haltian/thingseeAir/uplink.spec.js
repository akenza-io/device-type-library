import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Haltian Thingsee air Sensor Uplink", () => {
  let environmentSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let co2Schema = null;
  let tvocSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    environmentSchema = loadSchema(`${import.meta.dirname}/environment.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    co2Schema = loadSchema(`${import.meta.dirname}/co2.schema.json`);
    tvocSchema = loadSchema(`${import.meta.dirname}/tvoc.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Haltian Thingsee air Sensor environment payload on TIME", () => {
      const data = {
        data: {
          tsmId: 12100,
          tsmTuid: "TSAR02TG122043408",
          temp: 26.4,
          tsmTs: 1657109290,
          humd: 35.2,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          airp: 97017.737,
        },
      };
      expectSample("environment", environmentSchema, (data) => {
        assert.equal(data.pressure, 97017.737);
        assert.equal(data.temperature, 26.4);
        assert.equal(data.humidity, 35.2);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.reason, "TIME");
      });

      consume(data);
    });

    it("should decode the Haltian Thingsee air Sensor environment payload on CHANGE", () => {
      const data = {
        data: {
          tsmId: 12100,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657108990,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 9,
          deploymentGroupId: "prch00switzerland",
          airp: 97021.277,
        },
      };
      expectSample("environment", environmentSchema, (data) => {
        assert.equal(data.pressure, 97021.277);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.reason, "CHANGE");
      });

      consume(data);
    });

    it("should decode the Haltian Thingsee air Sensor co2 payload", () => {
      const data = {
        data: {
          tsmId: 24100,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657105690,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          carbonDioxide: 460,
          status: 0,
        },
      };
      expectSample("co2", co2Schema, (data) => {
        assert.equal(data.co2, 460);
        assert.equal(data.co2Status, "OK");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.reason, "TIME");
      });

      consume(data);
    });

    it("should decode the Haltian Thingsee air Sensor tvoc payload", () => {
      const data = {
        data: {
          tvoc: 10,
          tsmId: 24101,
          tsmTuid: "TSAR02TG122043408",
          tsmTs: 1657105690,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
        },
      };
      expectSample("tvoc", tvocSchema, (data) => {
        assert.equal(data.tvoc, 10);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.reason, "TIME");
      });

      consume(data);
    });
  });
});
