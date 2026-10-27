import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Haltian Thingsee Environment Sensor Uplink", () => {
  let environmentSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let orientationSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    environmentSchema = loadSchema(`${import.meta.dirname}/environment.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    orientationSchema = loadSchema(`${import.meta.dirname}/orientation.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Haltian Thingsee Environment Sensor environment payload on CHANGE", () => {
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

    it("should decode the Haltian Thingsee Environment Sensor orientation payload", () => {
      const data = {
        data: {
          tsmId: 1111,
          tsmTuid: "TSEN01E6214703511",
          accz: 950,
          tsmTs: 1657199579,
          accy: 37,
          tsmGw: "TSGW06EWK14800496",
          tsmEv: 10,
          deploymentGroupId: "prch00switzerland",
          accx: 307,
        },
      };
      expectSample("orientation", orientationSchema, (data) => {
        assert.equal(data.accX, 307);
        assert.equal(data.accY, 37);
        assert.equal(data.accZ, 950);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.reason, "TIME");
      });

      consume(data);
    });
  });
});
