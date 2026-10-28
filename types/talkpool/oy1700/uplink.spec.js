import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Talkpool OY1700 Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Talkpool OY1700 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "4020b1000000000000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 23.5);
        assert.equal(data.humidity, 26.3);
        assert.equal(data.pm1, 0);
        assert.equal(data.pm2_5, 0);
        assert.equal(data.pm10, 0);
      });

      consume(data);
    });
  });
});
