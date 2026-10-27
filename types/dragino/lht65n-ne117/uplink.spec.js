import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino LHT65N-NE117 Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let externalSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    externalSchema = loadSchema(`${import.meta.dirname}/external.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Dragino LHT65N-NE117 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "cc5609c001ec01096c7fff",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryStatus, "GOOD");
        assert.equal(data.batteryVoltage, 3.158);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 49.2);
        assert.equal(data.temperature, 24.96);
      });

      expectSample("external", externalSchema, (data) => {
        assert.equal(data.tempDS, 24.12);
      });

      consume(data);
    });
  });
});
