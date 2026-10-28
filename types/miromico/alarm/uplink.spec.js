import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Miromico alarm Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  let sceneSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    sceneSchema = loadSchema(`${import.meta.dirname}/scene.schema.json`);
  });

  describe("consume()", () => {
    it("should decode Miromico alarm battery usage payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "050255000000",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryUsage, 85);
      });

      consume(data);
    });

    it("should decode Miromico alarm battery voltage payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "03030CE4",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 12);
        assert.equal(data.batteryTemperature, 228);
      });

      consume(data);
    });

    it("should decode Miromico alarm current scene payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "020407",
        },
      };

      expectSample("scene", sceneSchema, (data) => {
        assert.equal(data.currentScene, 7);
      });

      consume(data);
    });

    it("should decode Miromico alarm scene color payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "060502FF9A00",
        },
      };

      expectSample("scene", sceneSchema, (data) => {
        assert.equal(data.currentScene, 2);
        assert.equal(data.red, 255);
        assert.equal(data.green, 154);
        assert.equal(data.blue, 0);
      });

      consume(data);
    });

    it("should decode Miromico alarm scene timeout payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "050602000A",
        },
      };

      expectSample("scene", sceneSchema, (data) => {
        assert.equal(data.currentScene, 2);
        assert.equal(data.timeoutMin, 10);
      });

      consume(data);
    });

    it("should decode Miromico alarm scene melody payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "0507020301",
        },
      };

      expectSample("scene", sceneSchema, (data) => {
        assert.equal(data.currentScene, 2);
        assert.equal(data.melody, "SLOW");
        assert.equal(data.melodyRepeat, true);
      });

      consume(data);
    });

    it("should split a mixed payload into lifecycle and scene", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "03030CE4020407",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryVoltage, 12);
        assert.equal(data.batteryTemperature, 228);
      });

      expectSample("scene", sceneSchema, (data) => {
        assert.equal(data.currentScene, 7);
      });

      consume(data);
    });
  });
});
