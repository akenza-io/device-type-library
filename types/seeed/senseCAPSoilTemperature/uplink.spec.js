import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010610007D0000010710725100009A21",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 32);
        assert.equal(data.soilHumidity, 20.85);
      });

      consume(data);
    });
  });
});
