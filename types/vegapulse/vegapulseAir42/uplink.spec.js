import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Vegapulse Air 42", () => {
  let distanceSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let temperatureSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    distanceSchema = loadSchema(`${import.meta.dirname}/distance.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Vegapulse Air payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "083FA31F152D2401042009",
        },
      };

      expectSample("distance", distanceSchema, (data) => {
        assert.equal(data.distanceMm, 1274.3860483169556);
        assert.equal(data.distanceCm, 127.43860483169556);
        assert.equal(data.distanceM, 1.2743860483169556);
        assert.equal(data.distanceInch, 50.172679067596675);
        assert.equal(data.distanceFt, 4.181056588966389);
        assert.equal(data.sensorMeasurementUnit, "METERS");
        assert.equal(data.inclinationDegree, 9);
      });

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 26);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 36);
        assert.equal(data.namurState, 'GOOD');
      });

      consume(data);
    });
  });
});
