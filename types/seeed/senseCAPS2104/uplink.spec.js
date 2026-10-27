import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Seeed SenseCAP2104 Soil Moisture and Temperature Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP2104 Soil Moisture and Temperature Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010610a05a0000010710000000004783",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.soilHumidity, 0);
        assert.equal(data.soilTemperature, 23.2);
      });

      consume(data);
    });
  });
});
