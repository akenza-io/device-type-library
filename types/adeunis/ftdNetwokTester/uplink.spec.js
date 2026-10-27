import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("FTD Network tester", () => {
  let defaultSchema = null;
  let consume = null;
  let gpsSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    gpsSchema = loadSchema(`${import.meta.dirname}/gps.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the FTD Network payload", () => {
      const data = {
        data: {
          port: 3,
          payloadHex: "be1a47248480008320601512100da1",
        },
      };

      expectSample("gps", gpsSchema, (data) => {
        assert.equal(data.latitude, 47.41413333333333);
        assert.equal(data.longitude, 8.534333333333333);
        assert.equal(data.satellites, 5);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 26);
        assert.equal(data.trigger, "PUSHBUTTON");
        assert.equal(data.uplink, 18);
        assert.equal(data.downlink, 16);
        assert.equal(data.batteryVoltage, 3.489);
        assert.equal(data.batteryLevel, 29);
      });

      consume(data);
    });
  });
});
