import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Tektelic eDoctorV1 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let defaultSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the eDoctorV1 standard payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "EA900C0564D5488B19",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 92);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.skinTemperature, 37.2);
        assert.equal(data.respiratoryRate, 12);
        assert.equal(data.uaModeActive, false);
        assert.equal(data.chestExpansion, 1);
        assert.equal(data.activityFactor, 1);
        assert.equal(data.position, 85);
        assert.equal(data.heartRate, 72);
        assert.equal(data.skinTemperature2, 37);
        assert.equal(data.activityIntensity, 0.25);
      });

      consume(data);
    });

    it("should decode the eDoctorV1 invalid payload", () => {
      const data = {
        data: {
          port: 10,
          payloadHex: "fbffffffffffffffff",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 99);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.activityFactor, 1);
        assert.equal(data.uaModeActive, true);
      });

      consume(data);
    });
  });
});
