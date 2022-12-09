const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Talkpool OY1700 Uplink", () => {
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
    it("should decode the Talkpool OY1700 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "4020b1000000000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 23.5);
        assert.equal(value.data.humidity, 26.3);
        assert.equal(value.data.pm1, 0);
        assert.equal(value.data.pm2_5, 0);
        assert.equal(value.data.pm10, 0);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
