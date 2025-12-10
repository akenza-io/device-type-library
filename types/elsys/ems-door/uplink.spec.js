import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Elsys EMS Door uplink", () => {
  let reedSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/reed.schema.json`).then((parsedSchema) => {
      reedSchema = parsedSchema;
      done();
    });
  });

  let accelerationSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/acceleration.schema.json`).then((parsedSchema) => {
      accelerationSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
  });

  let doorCountSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/door_count.schema.json`)
      .then((parsedSchema) => {
        doorCountSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode Elsys EMS Door payload", () => {
      const data = {
        state: {},
        data: {
          port: 5,
          payloadHex: "033e01ff070e2f0b000007920d010f00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.pulseAbs1, 1938);
        assert.equal(value.data.relativePulse1, 0);
        assert.equal(value.data.reed, true);

        validateSchema(value.data, reedSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "acceleration");
        assert.equal(value.data.accMotion, 0);
        assert.equal(value.data.accX, 1);
        assert.equal(value.data.accY, 0);
        assert.equal(value.data.accZ, -0);

        validateSchema(value.data, accelerationSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.631);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 1938);
        assert.equal(value.partialUsage, 0);
      });

      consume(data);
    });

    it("should decode Elsys EMS Door payload & give out lastpuls increment", () => {
      const data = {
        state: {
          lastCount: 1700,
          partialUsage: 0
        },
        data: {
          port: 5,
          payloadHex: "033e01ff070e2f0b000007920d010f00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 238);
        assert.equal(value.data.usageCount, 119);

        validateSchema(value.data, doorCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.pulseAbs1, 1938);
        assert.equal(value.data.relativePulse1, 238);
        assert.equal(value.data.reed, true);

        validateSchema(value.data, reedSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "acceleration");
        assert.equal(value.data.accMotion, 0);
        assert.equal(value.data.accX, 1);
        assert.equal(value.data.accY, 0);
        assert.equal(value.data.accZ, -0);

        validateSchema(value.data, accelerationSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.631);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 1938);
        assert.equal(value.partialUsage, 0);
      });

      consume(data);
    });

    it("should decode Elsys EMS Door event payload and count up the state correctly", () => {
      const data = {
        state: {
          lastCount: 1938,
          partialUsage: 0
        },
        data: {
          port: 5,
          payloadHex: "0d01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 1);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.pulseAbs1, 1939);
        assert.equal(value.data.relativePulse1, 1);
        assert.equal(value.data.reed, true);

        validateSchema(value.data, reedSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 1939);
        assert.equal(value.partialUsage, 1);
      });

      consume(data);
    });

    it("should decode Elsys EMS Door event payload and not count up only repeat", () => {
      const data = {
        state: {
          lastCount: 1939,
          partialUsage: 0
        },
        data: {
          port: 5,
          payloadHex: "0d00",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "reed");
        assert.equal(value.data.pulseAbs1, 1939);
        assert.equal(value.data.relativePulse1, 0);
        assert.equal(value.data.reed, false);

        validateSchema(value.data, reedSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 1939);
        assert.equal(value.partialUsage, 0);
      });

      consume(data);
    });
  });
});
