
import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WS156 Uplink", () => {
  let buttonPressedSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    buttonPressedSchema = loadSchema(`${import.meta.dirname}/button_pressed.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the lifecycle WS136 & WS156 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "ff0bffff0101ff166592b32851010013ff090100ff0a0102",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.hardwareVersion, "1.0");
        assert.equal(data.powerOn, true);
        assert.equal(data.protocolVersion, 1);
        assert.equal(data.serialNumber, "6592b32851010013");
        assert.equal(data.softwareVersion, "1.2");
      });

      consume(data);
    });

    it("should decode should decode the WS136 & WS156 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "017564ff34011800",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      expectSample("button_pressed", buttonPressedSchema, (data) => {
        assert.equal(data.buttonNumber, 1);
        assert.equal(data.command, 24);
      });

      consume(data);
    });
  });
});
