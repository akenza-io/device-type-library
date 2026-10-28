import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Pressac CT Clamp Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Pressac CT Clamp single channel payload", () => {
      const data = {
        data: {
          payloadHex: "0000000016040100",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.ch1Current, 0);
        assert.equal(data.ch2Current, 10.46);
        assert.equal(data.ch3Current, 0);
        assert.equal(data.counter, 1);
      });

      consume(data);
    });

    it("should decode the Pressac CT Clamp three channel payload", () => {
      const data = {
        data: {
          payloadHex: "7B00C801150305",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.ch1Current, 4.56);
        assert.equal(data.ch2Current, 7.89);
        assert.equal(data.ch3Current, 1.23);
        assert.equal(data.counter, 5);
      });

      consume(data);
    });
  });
});
