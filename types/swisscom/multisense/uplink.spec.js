

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Swisscom Multisense Uplinks", () => {
  let temperatureSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/temperature.schema.json`)
      .then((parsedSchema) => {
        temperatureSchema = parsedSchema;
        done();
      });
  });

  let humiditySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/humidity.schema.json`)
      .then((parsedSchema) => {
        humiditySchema = parsedSchema;
        done();
      });
  });

  let buttonEventSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/button_event.schema.json`)
      .then((parsedSchema) => {
        buttonEventSchema = parsedSchema;
        done();
      });
  });

  let reedCounterSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/reed_counter.schema.json`)
      .then((parsedSchema) => {
        reedCounterSchema = parsedSchema;
        done();
      });
  });

  let motionCounterSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/motion_counter.schema.json`)
      .then((parsedSchema) => {
        motionCounterSchema = parsedSchema;
        done();
      });
  });

  let accelerationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/acceleration.schema.json`)
      .then((parsedSchema) => {
        accelerationSchema = parsedSchema;
        done();
      });
  });

  let eventSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/event.schema.json`).then((parsedSchema) => {
      eventSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "temperature");
        assert.equal(value.data.temperature, 23.73);

        validateSchema(value.data, temperatureSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "humidity");
        assert.equal(value.data.humidity, 55);

        validateSchema(value.data, humiditySchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed_counter");
        assert.equal(value.data.reedCounter, 23);
        assert.equal(value.data.relativeReedCounter, 0);

        validateSchema(value.data, reedCounterSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "motion_counter");
        assert.equal(value.data.motionCounter, 4738);

        validateSchema(value.data, motionCounterSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "acceleration");
        assert.equal(value.data.accX, 1016);
        assert.equal(value.data.accY, 124);
        assert.equal(value.data.accZ, -4);

        validateSchema(value.data, accelerationSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.event, "TIMED_EVENT");
        validateSchema(value.data, eventSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.payloadVersion, 1);
        assert.equal(value.data.mode, 0);
        assert.equal(value.data.batteryVoltage, 3);
        assert.equal(value.data.batteryLevel, 87);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastReed, 23);
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the Swisscom Multisense button event payload", () => {
      const data = {
        state: {},
        data: {
          port: 3,
          payloadHex: "020040b5",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "button_event");
        assert.equal(value.data.buttonEvent, 1);
        validateSchema(value.data, buttonEventSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.event, "BUTTON_EVENT");
        validateSchema(value.data, eventSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.payloadVersion, 2);
        assert.equal(value.data.mode, 0);
        assert.equal(value.data.batteryVoltage, 3.1);
        assert.equal(value.data.batteryLevel, 100);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

      consume(data);
    });
  });

  describe("consume()", () => {
    it("should decode the Swisscom Multisense reed event payload", () => {
      const data = {
        state: {
          lastReed: 2494,
        },
        data: {
          port: 3,
          payloadHex: "020020a9030a86",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed_counter");
        assert.equal(value.data.reedCounter, 2694);
        assert.equal(value.data.relativeReedCounter, 200);

        validateSchema(value.data, reedCounterSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "event");
        assert.equal(value.data.event, "REED_EVENT");
        validateSchema(value.data, eventSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.payloadVersion, 2);
        assert.equal(value.data.mode, 0);
        assert.equal(value.data.batteryVoltage, 3);
        assert.equal(value.data.batteryLevel, 100);
        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastReed, 2694);
      });

      consume(data);
    });
  });
});
