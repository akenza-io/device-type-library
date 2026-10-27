import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Swisscom Multisense Uplinks", () => {
  let temperatureSchema = null;
  let consume = null;
  let humiditySchema = null;
  let buttonEventSchema = null;
  let reedCounterSchema = null;
  let motionCounterSchema = null;
  let accelerationSchema = null;
  let eventSchema = null;
  let lifecycleSchema = null;
  let doorCountSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    buttonEventSchema = loadSchema(`${import.meta.dirname}/button_event.schema.json`);
    reedCounterSchema = loadSchema(`${import.meta.dirname}/reed_counter.schema.json`);
    motionCounterSchema = loadSchema(`${import.meta.dirname}/motion_counter.schema.json`);
    accelerationSchema = loadSchema(`${import.meta.dirname}/acceleration.schema.json`);
    eventSchema = loadSchema(`${import.meta.dirname}/event.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    doorCountSchema = loadSchema(`${import.meta.dirname}/door_count.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Swisscom Multisense timed event with all datatopics", () => {
      const data = {
        state: {},
        data: {
          port: 3,
          payloadHex: "010080a3010945026e0300170412820503f8007cfffc",
        },
      };

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 23.73);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 55);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 23);
        assert.equal(value.partialUsage, 0);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("reed_counter", reedCounterSchema, (data) => {
        assert.equal(data.reedCounter, 23);
        assert.equal(data.relativeReedCounter, 0);
      });

      expectSample("motion_counter", motionCounterSchema, (data) => {
        assert.equal(data.motionCounter, 4738);
      });

      expectSample("acceleration", accelerationSchema, (data) => {
        assert.equal(data.accX, 1016);
        assert.equal(data.accY, 124);
        assert.equal(data.accZ, -4);
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.event, "TIMED_EVENT");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.payloadVersion, 1);
        assert.equal(data.mode, 0);
        assert.equal(data.batteryVoltage, 3);
        assert.equal(data.batteryLevel, 87);
      });

      consume(data);
    });

    it("should decode the Swisscom Multisense button event payload", () => {
      const data = {
        state: {},
        data: {
          port: 3,
          payloadHex: "020040b5",
        },
      };

      expectSample("button_event", buttonEventSchema, (data) => {
        assert.equal(data.buttonEvent, 1);
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.event, "BUTTON_EVENT");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.payloadVersion, 2);
        assert.equal(data.mode, 0);
        assert.equal(data.batteryVoltage, 3.1);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });

    it("should decode the Swisscom Multisense reed event payload", () => {
      const data = {
        state: {
          lastCount: 2494,
          partialUsage: 0
        },
        data: {
          port: 3,
          payloadHex: "020020a9030a86",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 2694);
        assert.equal(value.partialUsage, 0);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 200);
        assert.equal(data.usageCount, 100);
      });

      expectSample("reed_counter", reedCounterSchema, (data) => {
        assert.equal(data.reedCounter, 2694);
        assert.equal(data.relativeReedCounter, 200);
      });

      expectSample("event", eventSchema, (data) => {
        assert.equal(data.event, "REED_EVENT");
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.payloadVersion, 2);
        assert.equal(data.mode, 0);
        assert.equal(data.batteryVoltage, 3);
        assert.equal(data.batteryLevel, 100);
      });

      consume(data);
    });
  });
});
