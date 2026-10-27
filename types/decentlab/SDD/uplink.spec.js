import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab SDD Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab SDD payload", () => {
      const data = {
        data: {
          payloadHex:
            "0243e300058000800080008000800080008741877b8749876c876c876600000000000000000000014a09e3",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.moistureAtLevel0, 0);
        assert.equal(data.moistureAtLevel1, 0);
        assert.equal(data.moistureAtLevel2, 0);
        assert.equal(data.moistureAtLevel3, 0);
        assert.equal(data.moistureAtLevel4, 0);
        assert.equal(data.moistureAtLevel5, 0);
        assert.equal(data.salinityAtLevel0, -100);
        assert.equal(data.salinityAtLevel1, -100);
        assert.equal(data.salinityAtLevel2, -100);
        assert.equal(data.salinityAtLevel3, -100);
        assert.equal(data.salinityAtLevel4, -100);
        assert.equal(data.salinityAtLevel5, 230);
        assert.equal(data.temperatureAtLevel0, 18.57);
        assert.equal(data.temperatureAtLevel1, 19.15);
        assert.equal(data.temperatureAtLevel2, 18.65);
        assert.equal(data.temperatureAtLevel3, 19);
        assert.equal(data.temperatureAtLevel4, 19);
        assert.equal(data.temperatureAtLevel5, 18.94);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.531);
        assert.equal(data.deviceId, 17379);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});