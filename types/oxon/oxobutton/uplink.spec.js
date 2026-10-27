import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Oxon Oxobutton Q Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Oxon Oxobutton Q payload", () => {
      const data = {
        data: {
          payloadHex: "30000100001a64140070ff69101a",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.hbIRQ, true);
        assert.equal(data.accIRQ, false);
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.buttonId, 0);
        assert.equal(data.imageID, 26);
        assert.equal(data.accX, 0.027);
        assert.equal(data.accY, -0.037);
        assert.equal(data.accZ, 1.006);
      });

      consume(data);
    });
  });
});
