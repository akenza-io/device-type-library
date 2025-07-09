const chai = require("chai");
const { validate } = require("jsonschema");
const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Niagara Water Uplink", () => {
  let consumptionSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/consumption.schema.json`)
      .then((parsedSchema) => {
        consumptionSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastConsumptionCumulative, 9453146);
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "consumption");
        assert.equal(value.data.consumption, 0);
        assert.equal(value.data.consumptionCumulative, 9453146);

        validate(value.data, consumptionSchema, { throwError: true });
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
              divider: 1000,
            },
          },
          topic: "energy_energyConsumed",
          data: {
            value: 9453146,
            status: 0,
          },
        };

        utils.expectEmits((type, value) => {
          assert.equal(type, "state");
          assert.equal(value.lastConsumptionCumulative, 9453146);
        });

        utils.expectEmits((type, value) => {
          assert.equal(type, "sample");
          assert.isNotNull(value);
          assert.typeOf(value.data, "object");

          assert.equal(value.topic, "consumption");
          assert.equal(value.data.consumption, 3.146);
          assert.equal(value.data.consumptionCumulative, 9453.146);

          validate(value.data, consumptionSchema, { throwError: true });
        });

        consume(data);
      });
    });
  });
});
