
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WS52X Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS52X payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0374ED0806835604000008700105815207C9A400048001000000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.current, 164);
        assert.equal(data.factor, 82);
        assert.equal(data.power, 1);
        assert.equal(data.powerConsumption, 1110);
        assert.equal(data.state, "OPEN");
        assert.equal(data.voltage, 228.5);
      });

      consume(data);
    });
  });
});
