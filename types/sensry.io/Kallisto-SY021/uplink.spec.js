import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Kallisto SY021 Uplink", () => {
  let motionSchema = null;
  let environmentSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  let script = null;

  before((done) => {
    script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    loadSchema(`${__dirname}/motion.schema.json`)
      .then((parsedSchema) => {
        motionSchema = parsedSchema;
        return loadSchema(`${__dirname}/environment.schema.json`);
      })
      .then((parsedSchema) => {
        environmentSchema = parsedSchema;
        return loadSchema(`${__dirname}/lifecycle.schema.json`);
      })
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should forward the motion upload payload", () => {
      const data = {
        data: {
          topic: "motion",
          sensors: {
            accelX: 0.12,
            accelY: 0.34,
            accelZ: 9.81,
            gyroX: 1.2,
            gyroY: 2.3,
            gyroZ: 3.4,
            magX: 0.01,
            magY: 0.02,
            magZ: 0.03
          }
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "motion");
        assert.equal(value.data.accelX, 0.12);
        assert.equal(value.data.accelY, 0.34);
        assert.equal(value.data.accelZ, 9.81);
        assert.equal(value.data.gyroX, 1.2);
        assert.equal(value.data.gyroY, 2.3);
        assert.equal(value.data.gyroZ, 3.4);
        assert.equal(value.data.magX, 0.01);
        assert.equal(value.data.magY, 0.02);
        assert.equal(value.data.magZ, 0.03);

        validateSchema(value.data, motionSchema, { throwError: true });
      });

      consume(data);
    });

    it("should forward the environment upload payload", () => {
      const data = {
        data: {
          topic: "environment",
          sensors: {
            temperature: 23.1,
            humidity: 56,
            co2: 700,
            voc: 120,
            pressure: 1013.2,
            light: 400,
            noise: 47,
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "environment");
        assert.equal(value.data.temperature, 23.1);
        assert.equal(value.data.humidity, 56);
        assert.equal(value.data.co2, 700);
        assert.equal(value.data.voc, 120);
        assert.equal(value.data.pressure, 1013.2);
        assert.equal(value.data.light, 400);
        assert.equal(value.data.noise, 47);

        validateSchema(value.data, environmentSchema, { throwError: true });
      });

      consume(data);
    });

    it("should forward the lifecycle upload payload", () => {
      const data = {
        data: {
          topic: "lifecycle",
          sensors: {
            batteryLevel: 89,
          },
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 89);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should not emit motion payloads when required fields are missing", () => {
      const data = {
        data: {
          topic: "motion",
          sensors: {
            accelX: 0.12,
          },
        },
      };

      const emitted = [];
      script.__set__("emit", (type, value) => emitted.push([type, value]));

      script.__get__("consume")(data);

      assert.lengthOf(emitted, 0);
    });

    it("should not emit unknown topics", () => {
      const data = {
        data: {
          topic: "unknown",
          sensors: {
            value: 1,
          },
        },
      };

      const emitted = [];
      script.__set__("emit", (type, value) => emitted.push([type, value]));

      script.__get__("consume")(data);

      assert.lengthOf(emitted, 0);
    });
  });
});
