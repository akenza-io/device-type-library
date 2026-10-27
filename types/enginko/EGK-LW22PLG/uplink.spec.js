
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("EGK-LW22PLG Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the EGK-LW12MET payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "092f2725246be100003edefeff49d4010043772f00",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.activation, 3110723);
        assert.equal(data.activeEnergy, 57707);
        assert.equal(data.apparentEnergy, 119881);
        assert.equal(data.reactiveEnergy, -74178);
      });

      consume(data);
    });
  });
});
