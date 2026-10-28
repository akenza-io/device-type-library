import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Milesight TS301 Uplink", () => {
  let consume = null;
  let alarmSchema = null;
  let climateSchema = null;
  let magnetSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    alarmSchema = loadSchema(`${import.meta.dirname}/alarm.schema.json`);
    climateSchema = loadSchema(`${import.meta.dirname}/climate.schema.json`);
    magnetSchema = loadSchema(`${import.meta.dirname}/magnet.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("should decode should decode the Milesight TS301 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0175640367F100040001",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "climate");
        assert.equal(value.data.temperatureChannel1, 24.1);
        assert.equal(value.data.temperatureChannel2, null);

        // utils.validateSchema(value.data, climateSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "magnet");
        assert.equal(value.data.magnetChannel1, null);
        assert.equal(value.data.magnetChannel2, false);

        // utils.validateSchema(value.data, magnetSchema, { throwError: true });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS301 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "0175640367FB0004670101",
        },
      };

      expectSample("climate", climateSchema, (data) => {
        assert.equal(data.temperatureChannel1, 25.1);
        assert.equal(data.temperatureChannel2, 25.7);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS301 payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "01756403672701836727010004670801",
        },
      };

      expectSample("climate", climateSchema, (data) => {
        assert.equal(data.temperatureChannel1, 29.5);
        assert.equal(data.temperatureChannel2, 26.4);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alarm");
        assert.equal(value.data.alarmChannel1, "THRESHOLD_RELEASE");
        assert.equal(value.data.alarmChannel2, null);

        // utils.validateSchema(value.data, alarmSchema, { throwError: true });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode should decode the Milesight TS301 history payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "20CEC79AFA6444BDFFF600",
        },
      };

      expectSample("climate", climateSchema, (data) => {
        assert.equal(data.temperatureChannel1, -6.7);
        assert.equal(data.temperatureChannel2, 24.6);
      });

      consume(data);
    });
  });
});
