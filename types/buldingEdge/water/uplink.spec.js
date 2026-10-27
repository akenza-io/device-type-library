
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Niagara Water Uplink", () => {
  let consumptionSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    consumptionSchema = loadSchema(`${import.meta.dirname}/consumption.schema.json`);
  });

  describe("consume()", () => {
    it("should decode water payload", () => {
      const data = {
        topic: "energy_water",
        data: {
          value: 9453146,
          status: 0,
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastConsumptionCumulative, 9453146);
      });

      expectSample("consumption", consumptionSchema, (data) => {
        assert.equal(data.consumption, 0);
        assert.equal(data.consumptionCumulative, 9453146);
      });

      consume(data);
    });

    describe("consume()", () => {
      it("should decode energy payload & generate a state & use customfields", () => {
        const data = {
          state: {
            lastConsumptionCumulative: 9450000,
          },
          device: {
            customFields: {
              unitConversionDivider: 1000,
            },
          },
          topic: "energy_energyConsumed",
          data: {
            value: 9453146,
            status: 0,
          },
        };

        expectEmits((type, value) => {
          assert.equal(type, "state");
          assert.equal(value.lastConsumptionCumulative, 9453146);
        });

        expectSample("consumption", consumptionSchema, (data) => {
          assert.equal(data.consumption, 3.146);
          assert.equal(data.consumptionCumulative, 9453.146);
        });

        consume(data);
      });
    });
  });
});
