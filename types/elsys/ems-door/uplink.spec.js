import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Elsys EMS Door uplink", () => {
  let reedSchema = null;
  let consume = null;
  let accelerationSchema = null;
  let lifecycleSchema = null;
  let doorCountSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    reedSchema = loadSchema(`${import.meta.dirname}/reed.schema.json`);
    accelerationSchema = loadSchema(`${import.meta.dirname}/acceleration.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    doorCountSchema = loadSchema(`${import.meta.dirname}/door_count.schema.json`);
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

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("reed", reedSchema, (data) => {
        assert.equal(data.pulseAbs1, 1938);
        assert.equal(data.relativePulse1, 0);
        assert.equal(data.reed, true);
      });

      expectSample("acceleration", accelerationSchema, (data) => {
        assert.equal(data.accMotion, 0);
        assert.equal(data.accX, 62);
        assert.equal(data.accY, 1);
        assert.equal(data.accZ, -1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.631);
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

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 238);
        assert.equal(data.usageCount, 119);
      });

      expectSample("reed", reedSchema, (data) => {
        assert.equal(data.pulseAbs1, 1938);
        assert.equal(data.relativePulse1, 238);
        assert.equal(data.reed, true);
      });

      expectSample("acceleration", accelerationSchema, (data) => {
        assert.equal(data.accMotion, 0);
        assert.equal(data.accX, 62);
        assert.equal(data.accY, 1);
        assert.equal(data.accZ, -1);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.631);
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

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 1);
        assert.equal(data.usageCount, 0);
      });

      expectSample("reed", reedSchema, (data) => {
        assert.equal(data.pulseAbs1, 1939);
        assert.equal(data.relativePulse1, 1);
        assert.equal(data.reed, true);
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

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("reed", reedSchema, (data) => {
        assert.equal(data.pulseAbs1, 1939);
        assert.equal(data.relativePulse1, 0);
        assert.equal(data.reed, false);
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
