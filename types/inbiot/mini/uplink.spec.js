import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";






describe("inBiot MINI Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the inBiot MINI sensor payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0100fa0207032f000200000001000100010001ffffffffffff00024d494e49003440314fffff",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.type, "MINI");
        assert.equal(data.temperature, 25.0);
        assert.equal(data.humidity, 51.9);
        assert.equal(data.co2, 815);
        assert.isUndefined(data.tvoc);
        assert.isUndefined(data.pm2_5);
        assert.equal(data.vIndex, 52);
        assert.equal(data.tIndex, 64);
        assert.equal(data.virusIndex, 49);
        assert.equal(data.iaqIndex, 79);
        assert.equal(data.moldIndexStatus, "Calculating");
        assert.equal(data.noiseStatus, "Preheating");
        assert.equal(data.counter, 2);
      });

      consume(data);
    });
  });
});
