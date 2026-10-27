import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("IMBuilding MoodBox Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the IMBuilding MoodBox standart payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "03040004a30b00f7c50800015b00070003000200010002",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.great, 7);
        assert.equal(data.good, 3);
        assert.equal(data.mid, 2);
        assert.equal(data.bad, 1);
        assert.equal(data.worst, 2);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.deviceStatus, 0);
        assert.equal(data.batteryVoltage, 3.47);
      });

      consume(data);
    });
  });
});
