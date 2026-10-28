import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Niagara Occupancy Uplink", () => {
  let occupancySchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode occupancy payload", () => {
      const data = {
        topic: "occupancy_pir",
        data: {
          value: 0,
          status: 0,
        },
      };

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.motionCount, 0);
        assert.equal(data.occupied, false);
      });

      consume(data);
    });

    it("should decode occupancy payload", () => {
      const data = {
        topic: "occupancy_pir",
        data: {
          value: 1,
          status: 2,
        },
      };

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.motionCount, 1);
        assert.equal(data.occupied, true);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.status, "FAULT");
      });

      consume(data);
    });
  });
});
