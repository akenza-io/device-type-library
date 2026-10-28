import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Globalsat LT-20 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Globalsat LT-20 payload", (done) => {
      const data = {
        data: {
          port: 1,
          payloadHex: "80023032525AEFD2046400",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.longitude, 115.8162);
        assert.equal(data.latitude, -31.8965256);
        assert.equal(data.gpsFix, "Not fix");
        assert.equal(data.reportType, "Motion mode static report");
      });

      consume(data);
      done();
    });
  });
});
