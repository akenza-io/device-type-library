
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("AM307 Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the AM319 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0367EE0004687C05000106CB02077DA803087D25000973",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.co2, 936);
        assert.equal(data.humidity, 62);
        assert.equal(data.light, 2);
        assert.equal(data.pir, "TRIGGER");
        assert.equal(data.pressure, 0);
        assert.equal(data.temperature, 23.8);
        assert.equal(data.tvoc, 37);
      });

      consume(data);
    });
  });
});
