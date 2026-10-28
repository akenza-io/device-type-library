import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Decentlab TP Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Decentlab TP payload", () => {
      const data = {
        data: {
          payloadHex:
            "023e3e00038abc8a928aa08a848ab38a898ac38aad8ab78a928aa1000000000000000000000afc",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperatureAtLevel0, 27.48);
        assert.equal(data.temperatureAtLevel1, 27.06);
        assert.equal(data.temperatureAtLevel10, 27.21);
        assert.equal(data.temperatureAtLevel11, -327.68);
        assert.equal(data.temperatureAtLevel12, -327.68);
        assert.equal(data.temperatureAtLevel13, -327.68);
        assert.equal(data.temperatureAtLevel14, -327.68);
        assert.equal(data.temperatureAtLevel15, -327.68);
        assert.equal(data.temperatureAtLevel2, 27.2);
        assert.equal(data.temperatureAtLevel3, 26.92);
        assert.equal(data.temperatureAtLevel4, 27.39);
        assert.equal(data.temperatureAtLevel5, 26.97);
        assert.equal(data.temperatureAtLevel6, 27.55);
        assert.equal(data.temperatureAtLevel7, 27.33);
        assert.equal(data.temperatureAtLevel8, 27.43);
        assert.equal(data.temperatureAtLevel9, 27.06);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 2.812);
        assert.equal(data.deviceId, 15934);
        assert.equal(data.protocolVersion, 2);
      });

      consume(data);
    });
  });
});