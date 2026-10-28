import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("WS101 Uplink", () => {
  let buttonPressedSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    buttonPressedSchema = loadSchema(`${import.meta.dirname}/button_pressed.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the WS101 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "017510FF2E01",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 16);
      });

      expectSample("button_pressed", buttonPressedSchema, (data) => {
        assert.equal(data.press, "SHORT");
      });

      consume(data);
    });
  });
});
