const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Miromico REV2_V5 uplink", () => {
  let statusSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/status.schema.json`).then((parsedSchema) => {
      statusSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode Miromico REV2_V5 status payload", () => {
      const data = {
        data: {
          payloadHex: "0502e804000003038c27",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.usedCharges, 1256);
        assert.equal(value.data.voltage, 3.1);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.internalTemp, 39);

        utils.validateSchema(value.data, statusSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
