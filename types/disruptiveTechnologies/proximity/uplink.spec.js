import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample, validateSchema } from "test-utils";

describe("Disruptive Technologies Proximity Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  let touchSchema = null;
  let doorCountSchema = null;
  let washroomUsageSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    objectPresentSchema = loadSchema(`${import.meta.dirname}/object_present.schema.json`);
    touchSchema = loadSchema(`${import.meta.dirname}/touch.schema.json`);
    doorCountSchema = loadSchema(`${import.meta.dirname}/door_count.schema.json`);
    washroomUsageSchema = loadSchema(`${import.meta.dirname}/washroom_usage.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Proximity Sensor payload and init state", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresent",
        data: {
          eventType: "objectPresent",
          objectPresent: {
            state: "NOT_PRESENT",
            updateTime: "2021-09-15T14:48:05.948000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
      };

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("object_present", objectPresentSchema, (data) => {
        assert.equal(data.objectPresent, "NOT_PRESENT");
        assert.equal(data.proximity, false);
        assert.equal(data.count, 0);
        assert.equal(data.relativeCount, 0);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 0);
        assert.equal(value.partialUsage, 0);
        assert.equal(value.lastStatus, "NOT_PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });

    it("Check if the state counts up correctly", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresent",
        data: {
          eventType: "objectPresent",
          objectPresent: {
            state: "PRESENT",
            updateTime: "2021-09-15T14:48:05.948000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
        state: {
          lastCount: 0,
          partialUsage: 0,
          lastStatus: "NOT_PRESENT",
          lastSampleEmittedAt: new Date().getTime()
        }
      };

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 1);
        assert.equal(data.usageCount, 0);
      });

      expectSample("object_present", objectPresentSchema, (data) => {
        assert.equal(data.objectPresent, "PRESENT");
        assert.equal(data.proximity, true);
        assert.equal(data.count, 1);
        assert.equal(data.relativeCount, 1);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 1);
        assert.equal(value.partialUsage, 1);
        assert.equal(value.lastStatus, "PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });

    it("Repeat sample", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "touch",
        data: {
          eventType: "touch",
          touch: true
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
        state: {
          absoluteCount: 1,
          lastCount: 1,
          partialUsage: 1,
          lastStatus: "PRESENT",
          lastSampleEmittedAt: new Date().getTime() - 3600000
        }
      };

      expectSample("touch", touchSchema, (data) => {
        assert.equal(data.touch, true);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.count, 1);
        assert.equal(value.data.relativeCount, 0); // Should stay 0 as this is not a real sample
        assert.equal(value.data.repeat, true);

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

      consume(data);
    });

    it("should decode the Digital Technologies Proximity Sensor payload and also count washroom usage", () => {
      const data = {
        state: {
          lastCount: 200,
          partialUsage: 1,
          lastStatus: "NOT_PRESENT",
          lastSampleEmittedAt: new Date().getTime()
        },
        device: {
          tags: [
            "washroom_usage"
          ],
        },
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresent",
        data: {
          eventType: "objectPresent",
          objectPresent: {
            state: "PRESENT",
            updateTime: "2021-09-15T14:48:05.948000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
      };

      expectSample("washroom_usage", washroomUsageSchema, (data) => {
        assert.equal(data.absoluteUsageCount, 100);
        assert.equal(data.relativeUsageCount, 1);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 1);
        assert.equal(data.usageCount, 1);
      });

      expectSample("object_present", objectPresentSchema, (data) => {
        assert.equal(data.objectPresent, "PRESENT");
        assert.equal(data.proximity, true);
        assert.equal(data.count, 201);
        assert.equal(data.relativeCount, 1);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 201);
        assert.equal(value.partialUsage, 0);
        assert.equal(value.lastStatus, "PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });

    it("should decode the Digital Technologies Proximity Sensor payload and also not impact washroom usage", () => {
      const data = {
        state: {
          lastCount: 201,
          partialUsage: 1,
          lastStatus: "PRESENT",
        },
        device: {
          tags: [
            "washroom_usage"
          ],
        },
        eventId: "c510f9ag03fligl8tvag",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresent",
        data: {
          eventType: "objectPresent",
          objectPresent: {
            state: "NOT_PRESENT",
            updateTime: "2021-09-15T14:48:05.948000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
      };

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 0);
        assert.equal(data.usageCount, 0);
      });

      expectSample("object_present", objectPresentSchema, (data) => {
        assert.equal(data.objectPresent, "NOT_PRESENT");
        assert.equal(data.proximity, false);
        assert.equal(data.count, 201);
        assert.equal(data.relativeCount, 0);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 201);
        assert.equal(value.partialUsage, 1);
        assert.equal(value.lastStatus, "NOT_PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });

    it("Check if the washroom usages counts up correctly", () => {
      const data = {
        eventId: "c510f9ag03fligl8tvag",
        device: {
          tags: [
            "cubicle_usage"
          ],
        },
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/bjmgj6dp0jt000a5dcug",
        eventType: "objectPresent",
        data: {
          eventType: "objectPresent",
          objectPresent: {
            state: "PRESENT",
            updateTime: "2021-09-15T14:48:05.948000Z",
          },
        },
        timestamp: "2021-09-15T14:48:05.948000Z",
        labels: {},
        state: {
          lastCount: 201,
          partialUsage: 1,
          lastStatus: "NOT_PRESENT",
          lastSampleEmittedAt: new Date().getTime()
        }
      };

      expectSample("washroom_usage", washroomUsageSchema, (data) => {
        assert.equal(data.absoluteUsageCount, 101);
        assert.equal(data.relativeUsageCount, 1);
      });

      expectSample("door_count", doorCountSchema, (data) => {
        assert.equal(data.doorClosings, 1);
        assert.equal(data.usageCount, 1);
      });

      expectSample("object_present", objectPresentSchema, (data) => {
        assert.equal(data.objectPresent, "PRESENT");
        assert.equal(data.proximity, true);
        assert.equal(data.count, 202);
        assert.equal(data.relativeCount, 1);
        assert.equal(data.repeat, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 202);
        assert.equal(value.lastStatus, "PRESENT");
        assert.equal(value.partialUsage, 0);
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });
  });
});
