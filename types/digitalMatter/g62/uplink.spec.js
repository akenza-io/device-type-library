import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital matter G62 Uplink", () => {
  let gpsSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let digitalSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    digitalSchema = loadSchema(`${import.meta.dirname}/digital.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the digital matter G62 payload, port 1", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "AA26F5EC16A108450A12CAC9330000171C",
        },
      };

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.tripType, "MOVEMENT");
        assert.equal(data.latitude, -31.9478112);
        assert.equal(data.longitude, 115.8193424);
        assert.equal(data.gpsFixCurrent, true);
        assert.equal(data.headingDeg, 20);
        assert.equal(data.speedKmph, 18);
      });

      expectSample("digital", digitalSchema, (data) => {
        assert.equal(data.extPower, false);
        assert.equal(data.ignition, false);
        assert.equal(data.digitalInput1, true);
        assert.equal(data.digitalInput2, true);
        assert.equal(data.digitalOutput, false);
        assert.equal(data.extVoltage, 13.257);
        assert.equal(data.analogInput, 0);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 4.04);
        assert.equal(data.internalTemperature, 23);
      });

      consume(data);
    });
  });
});
