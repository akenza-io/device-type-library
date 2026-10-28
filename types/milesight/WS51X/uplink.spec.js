
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WS51X Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS51X payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "08700105816107c9a8000374830806831d000000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.current, 168);
        assert.equal(data.factor, 97);
        assert.equal(data.powerConsumption, 29);
        assert.equal(data.powerOn, true);
        assert.equal(data.voltage, 217.9);
      });

      consume(data);
    });
  });
});
