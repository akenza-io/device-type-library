import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Kallisto SY021 Uplink", () => {
  let motionSchema = null;
  let environmentSchema = null;
  let lifecycleSchema = null;
  let consume = null;
  let script = null;

  before(() => {
    script = rewire(`${import.meta.dirname}/uplink.js`);
    consume = init(script);
    motionSchema = loadSchema(`${import.meta.dirname}/motion.schema.json`);
    environmentSchema = loadSchema(`${import.meta.dirname}/environment.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
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

      expectSample("motion", motionSchema, (data) => {
        assert.equal(data.accelX, 0.12);
        assert.equal(data.accelY, 0.34);
        assert.equal(data.accelZ, 9.81);
        assert.equal(data.gyroX, 1.2);
        assert.equal(data.gyroY, 2.3);
        assert.equal(data.gyroZ, 3.4);
        assert.equal(data.magX, 0.01);
        assert.equal(data.magY, 0.02);
        assert.equal(data.magZ, 0.03);
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

      expectSample("environment", environmentSchema, (data) => {
        assert.equal(data.temperature, 23.1);
        assert.equal(data.humidity, 56);
        assert.equal(data.co2, 700);
        assert.equal(data.voc, 120);
        assert.equal(data.pressure, 1013.2);
        assert.equal(data.light, 400);
        assert.equal(data.noise, 47);
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

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 89);
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
