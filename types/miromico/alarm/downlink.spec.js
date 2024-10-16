const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("UC51X Downlink", () => {
  let consume = null;
  before((done) => {
    const script = rewire("./downlink.js");
    consume = utils.init(script);
    done();
  });

  describe("consume()", () => {
    it("should encode the miromic alarm sensor configs payload", () => {
      const data = {
        payload: {
          "actionType": "sensorConfigs",
          "confirmed": false,
          "dutyCycle": false,
          "classC": true,
          "buzzer": false,
          "statusIntervalMin": 10,
          "numLed": 16,
          "resetTimeH": 10
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "068020000a100a"); // class C is 0x20 not 0x40 Dev docs
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 3);
      });

      consume(data);
    });

    it("should encode the miromic alarm scene configs payload", () => {
      const data = {
        payload: {
          "actionType": "sceneConfigs",
          "currentScene": 1,
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "028101");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 3);
      });

      consume(data);
    });

    it("should encode the miromic alarm scene brightness payload", () => {
      const data = {
        payload: {
          "actionType": "brightnessConfigs",
          "brightnessPercent": 50,
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "02827f");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 3);
      });

      consume(data);
    });

    it("should encode the miromic alarm set volume payload", () => {
      const data = {
        payload: {
          "actionType": "volumeConfigs",
          "volume": "HIGH",
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "02850300"); // Volumes false Dev docs
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 3);
      });

      consume(data);
    });

    it("should encode the miromic alarm configure light payload", () => {
      const data = {
        payload: {
          "actionType": "lightConfigs",
          "selectedScene": 2,
          "red": 255,
          "green": 154,
          "blue": 0,
          "sceneTimeoutMin": 10,
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "078302ff9a00000a");
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 3);
      });

      consume(data);
    });

    it("should encode the miromic alarm configure buzzer payload", () => {
      const data = {
        payload: {
          "actionType": "buzzerConfigs",
          "selectedScene": 2,
          "red": 255,
          "green": 154,
          "blue": 0,
          "sceneTimeoutMin": 10,
          "buzzerMelody": "SLOW",
          "buzzerRepeat": true,
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "downlink");
        assert.isNotNull(value);

        assert.equal(value.payloadHex, "078302ff9a00000a0301"); // 07 or 09 Dev docs && 83 vs 84 dev docs
        assert.equal(value.confirmed, true);
        assert.equal(value.port, 3);
      });

      consume(data);
    });
  });
});
