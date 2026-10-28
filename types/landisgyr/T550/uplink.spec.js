import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Landis & Gyr WZU Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });
  describe("consume()", () => {
    it("should decode Landis & Gyr WZU default payload", () => {
      const data = {
        data: {
          port: 2,
          payloadHex:
            "000c06674847020c14528275030b2d0603000b3b0006000a5a15110a5e67060c782897486602fd170000",
        },
      };
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.energyUnit, "KWH");
        assert.equal(data.energy, 2474867);
        assert.equal(data.volume, 37582.52);
        assert.equal(data.power, 30.6);
        assert.equal(data.flow, 0.6);
        assert.equal(data.flowTemp, 111.5);
        assert.equal(data.backFlowTemp, 66.7);
      });
      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.header, "STANDARD");
        assert.equal(data.serialID, 66489728);
        assert.equal(data.errFlags, "000017");
      });
      consume(data);
    });
  });
});
