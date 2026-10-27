import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Netvox R711 uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Netvox R711 uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0101011d08790a7a000000",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 26.82);
        assert.equal(data.temperature, 21.69);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.version, 1);
        assert.equal(data.deviceType, 1);
        assert.equal(data.batteryVoltage, 2.9);
      });

      consume(data);
    });
  });
});
