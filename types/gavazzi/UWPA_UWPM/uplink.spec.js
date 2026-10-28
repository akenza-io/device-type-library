import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Gavazzi UWPA/UWPM", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Gavazzi UWPA/UWPM uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "01911409000092f000000093cc7400003ca247000000000000ff460001010a00",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.l2V, 232.4);
        assert.equal(data.l2A, 0.24);
        assert.equal(data.l2KW, 0.0299);
        assert.equal(data.totalKWh, 1833.8);
      });

      consume(data);
    });
  });
});
