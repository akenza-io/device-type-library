import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("EGK-LW20W00 Uplink", () => {
  describe("consume()", () => {
    let distanceSchema = null;
    let consume = null;
    let timesyncSchema = null;
    let lifecycleSchema = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      distanceSchema = loadSchema(`${import.meta.dirname}/distance.schema.json`);
      timesyncSchema = loadSchema(`${import.meta.dirname}/time_sync.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    });

    it("should decode EGK-LW20W00 distance payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "14013a52fc2c1f0c9600990064a20964",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.adc, 3103);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("distance", distanceSchema, (data) => {
        assert.equal(data.distance, 153);
        assert.equal(data.fillLevel, 100);
        assert.equal(data.temperature, 24.66);
      });

      consume(data);
    });

    it("should decode EGK-LW20W00 time_sync payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "01cbe38b28000223040701",
        },
      };

      expectSample("time_sync", timesyncSchema, (data) => {
        assert.equal(data.syncID, "cbe38b28");
        assert.equal(data.syncVersion, "00.02.23");
        assert.equal(data.applicationType, 407);
        assert.equal(data.rfu, 1);
      });
      consume(data);
    });
  });
});
