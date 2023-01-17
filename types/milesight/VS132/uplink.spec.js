const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("VS121 Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let countSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/count.schema.json`).then((parsedSchema) => {
      countSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode should decode the VS121 lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF166614C39694870000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.sn, 660012345678);
        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode should decode the VS121 count payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "04C903030002",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "count");
        assert.equal(value.data.peopleCounterAll, 3);
        assert.equal(value.data.region0, 0);
        assert.equal(value.data.region1, 1);
        assert.equal(value.data.region2, 0);
        assert.equal(value.data.regionCount, 3);
        utils.validateSchema(value.data, countSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
