import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

describe("Miromico alarm Downlink", () => {
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/downlink.js`));
  });

  function expectDownlink(payloadHex) {
    expectEmits((type, value) => {
      assert.equal(type, "downlink");
      assert.isNotNull(value);

      assert.equal(value.port, 3);
      assert.equal(value.confirmed, true);
      assert.equal(value.payloadHex, payloadHex);
    });
  }

  describe("consume()", () => {
    it("should forward a raw payloadHex", () => {
      const data = {
        payloadHex: "028101",
        port: 3,
        confirmed: false,
      };

      expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.equal(value.port, 3);
        assert.equal(value.confirmed, false);
        assert.equal(value.payloadHex, "028101");
      });

      consume(data);
    });

    it("should encode the device configuration", () => {
      const data = {
        payload: {
          actionType: "sensorConfigs",
          confirmed: false,
          dutyCycle: true,
          classC: true,
          buzzer: false,
          statusIntervalMin: 10,
          numLed: 16,
          resetTimeH: 10,
        },
      };

      expectDownlink("068060000a100a");
      consume(data);
    });

    it("should encode the device configuration with buzzer and long interval", () => {
      const data = {
        payload: {
          actionType: "sensorConfigs",
          confirmed: false,
          dutyCycle: false,
          classC: true,
          buzzer: true,
          statusIntervalMin: 720,
          numLed: 24,
          resetTimeH: 0,
        },
      };

      expectDownlink("06803002d01800");
      consume(data);
    });

    it("should encode set scene", () => {
      const data = {
        payload: {
          actionType: "sceneConfigs",
          currentScene: 1,
        },
      };

      expectDownlink("028101");
      consume(data);
    });

    it("should encode set brightness", () => {
      const data = {
        payload: {
          actionType: "brightnessConfigs",
          brightnessPercent: 100,
        },
      };

      expectDownlink("0282ff");
      consume(data);
    });

    it("should encode set volume", () => {
      const data = {
        payload: {
          actionType: "volumeConfigs",
          volume: "HIGH",
        },
      };

      expectDownlink("028503");
      consume(data);
    });

    it("should encode the LED scene configuration", () => {
      const data = {
        payload: {
          actionType: "lightConfigs",
          selectedScene: 2,
          red: 255,
          green: 154,
          blue: 0,
          sceneTimeoutMin: 10,
        },
      };

      expectDownlink("078302ff9a00000a");
      consume(data);
    });

    it("should encode the LED and buzzer scene configuration", () => {
      const data = {
        payload: {
          actionType: "buzzerConfigs",
          selectedScene: 2,
          red: 255,
          green: 154,
          blue: 0,
          sceneTimeoutMin: 10,
          buzzerMelody: "SLOW",
          buzzerRepeat: true,
        },
      };

      expectDownlink("098402ff9a00000a0301");
      consume(data);
    });

    it("should encode the HSP siren melodies", () => {
      const data = {
        payload: {
          actionType: "buzzerConfigs",
          selectedScene: 3,
          red: 255,
          green: 0,
          blue: 0,
          sceneTimeoutMin: 0,
          buzzerMelody: "ALWAYS_ON",
          buzzerRepeat: true,
        },
      };

      expectDownlink("098403ff000000000801");
      consume(data);
    });
  });
});
