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

  let lineSchema = null;
  before((done) => {
    utils.loadSchema(`${__dirname}/line.schema.json`).then((parsedSchema) => {
      lineSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode should decode the VS121 lifecycle payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "03d24800000004d2c800000006d20000000007d20000000009d2000000000ad2000000000cd2b41400000dd28d1a0000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.firmwareVersion, "132.1.0.1");
        assert.equal(value.data.hardwareVersion, "1.2");
        assert.equal(value.data.protocolVersion, 1);
        assert.equal(value.data.sn, "6614c39694870000");

        utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.periodicCounterIn, 0);
        assert.equal(value.data.periodicCounterOut, 0);
        assert.equal(value.data.totalCounterIn, 190);
        assert.equal(value.data.totalCounterOut, 305);

        utils.validateSchema(value.data, lineSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
