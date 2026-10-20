import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Miromico alarm Uplink", () => {
  let lifecycleSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  let sceneSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/scene.schema.json`)
      .then((parsedSchema) => {
        sceneSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Miromico alarm battery usage payload", () => {
      const data = {
        data: {
          port: 15,
          payloadHex: "050255000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryUsage, 85);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 12);
        assert.equal(value.data.batteryTemperature, 228);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "scene");
        assert.equal(value.data.currentScene, 7);

        validateSchema(value.data, sceneSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "scene");
        assert.equal(value.data.currentScene, 2);
        assert.equal(value.data.red, 255);
        assert.equal(value.data.green, 154);
        assert.equal(value.data.blue, 0);

        validateSchema(value.data, sceneSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "scene");
        assert.equal(value.data.currentScene, 2);
        assert.equal(value.data.timeoutMin, 10);

        validateSchema(value.data, sceneSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "scene");
        assert.equal(value.data.currentScene, 2);
        assert.equal(value.data.melody, "SLOW");
        assert.equal(value.data.melodyRepeat, true);

        validateSchema(value.data, sceneSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 12);
        assert.equal(value.data.batteryTemperature, 228);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "scene");
        assert.equal(value.data.currentScene, 7);

        validateSchema(value.data, sceneSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
