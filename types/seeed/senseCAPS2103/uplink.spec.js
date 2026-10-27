import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Seeed SenseCAP 2103 CO2, Temperature and Humidity Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP2103 CO2, Temperature and Humidity Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010410404e0d00010110106300000102101ac20000facc",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 25.36);
        assert.equal(data.humidity, 49.69);
        assert.equal(data.co2, 872);
      });

      consume(data);
    });
  });
});
