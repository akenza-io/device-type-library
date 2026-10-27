import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino Gro Point Air Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let soilMoistureSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    soilMoistureSchema = loadSchema(`${import.meta.dirname}/soil_moisture.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino Gro Point Air report uplink", () => {
      const data = {
        data: {
          payloadHex: "0ce73600d700d200cd00d700d200cd00d200d200d200cd00c87fff",
          port: 2,
        },
      };

      expectSample("soil_moisture", soilMoistureSchema, (data) => {
        assert.equal(data.soilMoisture1, 21.5);
        assert.equal(data.soilMoisture2, 21);
        assert.equal(data.soilMoisture3, 20.5);
        assert.equal(data.soilMoisture4, 21.5);
        assert.equal(data.soilMoisture5, 21);
        assert.equal(data.soilMoisture6, 20.5);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 3.303);
      });

      consume(data);
    });
  });
});
