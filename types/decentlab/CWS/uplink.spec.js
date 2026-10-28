import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab CWS Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab CWS payload", () => {
      const data = {
        data: {
          payloadHex:
            "02463900038a778a95977a874c80478a5e0b74",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 60.1);
        assert.equal(data.temperature, 27.09);
        assert.equal(data.angle, 71);
        assert.equal(data.dewPoint, 18.68);
        assert.equal(data.sensorTemperature, 26.54);
        assert.equal(data.surfaceTemperature, 26.79);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.932);
        assert.equal(data.deviceId, 17977);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});