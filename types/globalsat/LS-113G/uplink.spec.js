import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Globalsat LS-113G uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Globalsat LS-113G payload", () => {
      const data = {
        data: {
          payloadHex: "03096113950000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 50.13);
        assert.equal(data.temperature, 24.01);
        assert.equal(data.pm2_5, 0);
      });

      consume(data);
    });
  });
});
