import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Sensocon DataSling Series WM Uplink", () => {
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
    it("should decode a WM-DP02-HT02-TI01 uplink (field data)", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.humidity, 90.61);
        assert.equal(value.data.temperature, 27.07);
        assert.equal(value.data.temperatureF, 80.73);
        assert.equal(value.data.probeTemperature, 5.5);
        assert.equal(value.data.probeTemperatureF, 41.9);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.03);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({
        data: {
          port: 1,
          payloadHex: "aa039a99414001d475a142023837b542089a992742",
        },
      });
    });

    it("should decode the SD-0178 example payload", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, 2.95);
        assert.equal(value.data.humidity, 59.44);
        assert.equal(value.data.temperature, 26.46);
        assert.equal(value.data.temperatureF, 79.63);
        assert.equal(value.data.current, 4);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume({
        data: {
          port: 1,
          payloadHex: "aa00a3cc3c4002a0c16d42019a439f420700008040",
        },
      });
    });

    it("should decode a WM with pressure, gauge pressure and probe temperature", () => {
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "default");
        assert.equal(value.data.pressure, 0.5);
        assert.equal(value.data.gaugeDiffPressure, 12.5);
        assert.equal(value.data.probeTemperature, 22.5);
        assert.equal(value.data.probeTemperatureF, 72.5);
        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");
        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryVoltage, 3.05);
        assert.equal(value.data.payloadVersion, 170);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume({
        data: {
          port: 1,
          payloadHex: "aa0333334340000000003f13000048410800009142",
        },
      });
    });

    it("should decode a closed contact payload", () => {
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

    it("should emit nothing for an empty payload", () => {
      consume({ data: { port: 1, payloadHex: "" } });
    });
  });
});
