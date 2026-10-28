
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WS50X Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS50X payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "FF2931",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.switch1, "OPEN");
        assert.equal(data.switch2, "CLOSE");
        assert.equal(data.switch3, "CLOSE");
        assert.equal(data.switch1change, true);
        assert.equal(data.switch2change, true);
        assert.equal(data.switch3change, false);
      });

      consume(data);
    });
  });
});
