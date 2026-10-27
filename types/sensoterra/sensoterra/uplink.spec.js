import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Sensoterra Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Sensoterra payload", () => {
      const data = {
        data: {
          port: 11,
          payloadHex: "55534df5d454530d20",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.moisture, 85.3);
        assert.equal(data.temperature, 21.2);
      });

      consume(data);
    });
  });
});
