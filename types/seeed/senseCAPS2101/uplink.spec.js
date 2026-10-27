import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Seeed SenseCAP S2101 Air Temperature and Humidity Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP S2101 Air Temperature and Humidity Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010110B068000001021088F400008CFF",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 62.6);
        assert.equal(data.temperature, 26.8);
      });

      consume(data);
    });
  });
});
