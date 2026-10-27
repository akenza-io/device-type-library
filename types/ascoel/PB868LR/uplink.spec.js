
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Ascoel Push button Uplink", () => {
  let debugSchema = null;
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    debugSchema = loadSchema(`${import.meta.dirname}/debug.schema.json`);
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });
  describe("consume()", () => {
    it("should decode the Ascoel Push button firmware payload", () => {
      const data = {
        data: {
          port: 7,
          payloadHex: "010B0A4F04030F42",
        },
      };

      expectSample("debug", debugSchema, (data) => {
        assert.equal(data.firmwareVersion, "1.11.2639");
        assert.equal(data.hardwareRevision, "B");
        assert.equal(data.loraVersion, "4.3.15");
      });

      consume(data);
    });

    it("should decode the Ascoel Push button batteryLevel payload", () => {
      const data = {
        data: {
          port: 8,
          payloadHex: "5E",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 94);
      });

      consume(data);
    });

    it("should decode the Ascoel Push button button payload", () => {
      const data = {
        data: {
          port: 40,
          payloadHex: "010001",
        },
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.buttonPushed, true);
        assert.equal(data.buttonPushedNumeric, 1);
        assert.equal(data.count, 1);
      });

      consume(data);
    });
  });
});
