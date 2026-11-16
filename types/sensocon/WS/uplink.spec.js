import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Sensocon DataSling Series WS Uplink", () => {
  let defaultSchema = null;
  let lifecycleSchema = null;
  let consume = null;

  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode a WS-HT humidity and temperature payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.humidity, 57.73);
        assert.equal(value.data.temperature, 24.38);
        assert.equal(value.data.temperatureF, 75.89);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.09);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({
        data: { port: 1, payloadHex: "aa03a4704540012ac597420267e96642" },
      });
    });

    it("should decode a WS-DP differential pressure payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, 0.25);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa0366664640000000803e" } });
    });

    it("should decode a gauge pressure payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.gaugeDiffPressure, 12.5);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa03666646401300004841" } });
    });

    it("should decode a WS-TI probe temperature payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.probeTemperature, 22.5);
        assert.equal(value.data.probeTemperatureF, 72.5);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa03666646400800009142" } });
    });

    it("should decode a WS-VI voltage input payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.voltage, 5);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa0366664640060000a040" } });
    });

    it("should decode a WS-AI current input payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.current, 12);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa03666646400700004041" } });
    });

    it("should decode a WS-CI closed contact payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.contact, "CLOSED");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa0366664640040000803f" } });
    });

    it("should decode an open contact payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.contact, "OPEN");
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa03666646400400000000" } });
    });

    it("should ignore types without a specified unit", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({ data: { port: 1, payloadHex: "aa0366664640050000c03f" } });
    });

    it("should emit nothing for an empty payload", () => {
      consume({ data: { port: 1, payloadHex: "" } });
    });
  });
});
