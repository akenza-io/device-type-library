import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Pipiot peopleSense uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Pipiot peopleSense payload", () => {
      const data = {
        data: {
          payloadHex: "008d00090000400801008001",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.peopleCount, 9);
        assert.equal(data.peopleCountBin1, 0);
        assert.equal(data.peopleCountBin2, 4);
        assert.equal(data.peopleCountBin3, 2);
        assert.equal(data.peopleCountBin4, 1);
        assert.equal(data.peopleCountBin5, 2);
        assert.equal(data.peopleCountBin6, 0);
      });

      consume(data);
    });
  });
});
