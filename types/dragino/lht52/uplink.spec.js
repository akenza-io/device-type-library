import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Dragino LHT52 Uplink", () => {
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
    it("should decode the Dragino LHT52 report uplink", () => {
      const data = {
        data: {
          port: 2,
          payloadHex: "08CD0220F5C60161CD4EDD",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.humidity, 54.4);
        assert.equal(data.temperature, 22.53);
        assert.equal(data.extTemperature, -26.18);
      });

      consume(data);
    });
  });
});
