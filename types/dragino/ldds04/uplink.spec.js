import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino LDDS04 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino LDDS04 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "0D4A03160318031A031501",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.distance1, 79);
        assert.equal(data.distance2, 79.2);
        assert.equal(data.distance3, 79.4);
        assert.equal(data.distance4, 78.9);
        assert.equal(data.extTrigger, false);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.402);
        assert.equal(data.batteryLevel, 80);
      });

      consume(data);
    });
  });
});
