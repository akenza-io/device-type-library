import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Talkpool OY1210 Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Talkpool OY1210 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "3f1fb702b1",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 21.9);
        assert.equal(data.humidity, 25.3);
        assert.equal(data.co2, 689);
      });

      consume(data);
    });
  });
});
