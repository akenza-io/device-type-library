const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("AM319 Uplink", () => {
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
    it("should decode should decode the AM319 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "0367EE0004687C05000106CB02077DA803087D2500097366270A7D04000B7D20000C7D3000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.co2, 936);
        assert.equal(value.data.hcho, 0.04);
        assert.equal(value.data.humidity, 62);
        assert.equal(value.data.light, 2);
        assert.equal(value.data.pir, "TRIGGER");
        assert.equal(value.data.pm10, 48);
        assert.equal(value.data.pm2_5, 32);
        assert.equal(value.data.pressure, 1008.6);
        assert.equal(value.data.temperature, 23.8);
        assert.equal(value.data.tvoc, 37);

        utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
