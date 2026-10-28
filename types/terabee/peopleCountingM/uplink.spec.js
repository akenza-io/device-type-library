import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Terabee people counting M Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Terabee people counting M payload", () => {
      const data = {
        data: {
          uid: "pcm807d3a86224b",
          time: "946685671",
          type: "counters",
          value: {
            in: 34,
            out: 17,
          },
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.fw, 34);
        assert.equal(data.bw, 17);
      });

      consume(data);
    });
  });
});
