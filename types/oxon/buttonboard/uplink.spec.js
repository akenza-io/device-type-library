import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Oxon Buttonboard Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Oxon Buttonboard payload", () => {
      const data = {
        data: {
          payloadHex: "31040000011c6418fe75014cf89eaf330001500128",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.hbIRQ, false);
        assert.equal(data.accIRQ, false);
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.appMode, 1);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.longPressed, false);
        assert.equal(data.button1, false);
        assert.equal(data.button2, false);
        assert.equal(data.button3, true);
        assert.equal(data.button4, false);
        assert.equal(data.button5, false);
        assert.equal(data.button6, false);

        assert.equal(data.longPressed, 0);
        assert.equal(data.button1, 0);
        assert.equal(data.button2, 0);
        assert.equal(data.button3, 1);
        assert.equal(data.button4, 0);
        assert.equal(data.button5, 0);
        assert.equal(data.button6, 0);

        assert.equal(data.button1Enabled, false);
        assert.equal(data.button2Enabled, false);
        assert.equal(data.button3Enabled, true);
        assert.equal(data.button4Enabled, true);
        assert.equal(data.button5Enabled, true);
        assert.equal(data.button6Enabled, false);

        assert.equal(data.accX, -0.096);
        assert.equal(data.accY, 0.081);
        assert.equal(data.accZ, -0.461);
      });

      consume(data);
    });
  });
});
