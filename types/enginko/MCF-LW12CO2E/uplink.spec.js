import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("MCF-LW12CO2E Uplink", () => {
  describe("consume()", () => {
    let climateSchema = null;
    let consume = null;
    let lifecycleSchema = null;
    let timesyncSchema = null;

    before(() => {
      consume = init(rewire(`${import.meta.dirname}/uplink.js`));
      climateSchema = loadSchema(`${import.meta.dirname}/climate.schema.json`);
      lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
      timesyncSchema = loadSchema(`${import.meta.dirname}/time_sync.schema.json`);
    });

    it("should decode MCF-LW12CO2E climate payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "0ee040f62ac40b4c6e8a016d0119008f02e040f62ac40b4c6e8a01720119008f0262",
        },
      };

      expectSample("climate", climateSchema, (data) => {
        assert.equal(data.temperature, 30.12);
        assert.equal(data.humidity, 38);
        assert.equal(data.pressure, 1009.74);
        assert.equal(data.lux, 365);
        assert.equal(data.voc, 25);
        assert.equal(data.co2, 655);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 98);
      });

      expectSample("climate", climateSchema, (data) => {
        assert.equal(data.temperature, 30.12);
        assert.equal(data.humidity, 38);
        assert.equal(data.pressure, 1009.74);
        assert.equal(data.lux, 370);
        assert.equal(data.voc, 25);
        assert.equal(data.co2, 655);
      });

      consume(data);
    });

    it("should decode MCF-LW12CO2E time_sync payload", () => {
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
