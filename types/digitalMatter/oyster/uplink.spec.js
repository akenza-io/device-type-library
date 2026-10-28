import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital matter Oyster Uplink", () => {
  let positionSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    positionSchema = loadSchema(`${import.meta.dirname}/position.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the digital matter Oyster payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0030edec003224450000de",
        },
      };

      expectSample("position", positionSchema, (data) => {
        assert.equal(data.latitude, -32);
        assert.equal(data.longitude, 116);
        assert.equal(data.inTrip, false);
        assert.equal(data.fixFailed, false);
        assert.equal(data.headingDeg, 0);
        assert.equal(data.speedKmph, 0);
        assert.equal(data.batteryVoltage, 5.55);
      });

      consume(data);
    });

    it("should decode the digital matter Oyster payload, port 3", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "8BF3DC7B9438984278B85E",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.initialBatV, 5.1);
        assert.equal(data.txCount, 59136);
        assert.equal(data.tripCount, 194336);
        assert.equal(data.gpsSuccesses, 10464);
        assert.equal(data.gpsFails, 7232);
        assert.equal(data.aveGpsFixS, 96);
        assert.equal(data.aveGpsFailS, 133);
        assert.equal(data.aveGpsFreshenS, 120);
        assert.equal(data.wakeupsPerTrip, 56);
        assert.equal(data.uptimeWeeks, 189);
      });

      consume(data);
    });
  });
});
