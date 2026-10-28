import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Comtac LPN DO-2 Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Comtac LPN DO-2 payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "14000977ef00",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.do1, 0);
        assert.equal(data.do2, 0);
        assert.equal(data.do1Lora, 0);
        assert.equal(data.do2Lora, 0);
        assert.equal(data.manually, 0);
      });

      consume(data);
    });
  });
});
