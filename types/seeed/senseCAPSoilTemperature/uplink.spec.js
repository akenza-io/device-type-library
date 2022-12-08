const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Seeed SenseCAP Wireless Soil Moisture and Temperature Sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "010610007D0000010710725100009A21",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        if (value.topic === "default") {
          assert.equal(value.data.temperature, 32);
          assert.equal(value.data.soilHumidity, 20.85);
          utils.validateSchema(value.data, defaultSchema, { throwError: true });
        }
      });

      consume(data);
    });
  });
});
