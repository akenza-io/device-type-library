

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digital Technologies Proximity Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/object_present.schema.json`)
      .then((parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      });
  });

  let touchSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/touch.schema.json`)
      .then((parsedSchema) => {
        touchSchema = parsedSchema;
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

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 0);
        assert.equal(value.partialUsage, 0);
        assert.equal(value.lastStatus, "NOT_PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "NOT_PRESENT");
        assert.equal(value.data.proximity, false);
        assert.equal(value.data.count, 0);
        assert.equal(value.data.relativeCount, 0);

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
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

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 1);
        assert.equal(value.partialUsage, 1);
        assert.equal(value.lastStatus, "PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 1);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.count, 1);
        assert.equal(value.data.relativeCount, 1);

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "touch");
        assert.equal(value.data.touch, true);

        validateSchema(value.data, touchSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
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

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Digital Technologies Proximity Sensor payload and also count washroom usage", () => {
      const data = {
        state: {
          lastCount: 1,
          partialUsage: 1,
          lastStatus: "PRESENT",
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

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 2);
        assert.equal(value.partialUsage, 0);
        assert.equal(value.lastStatus, "PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 1);
        assert.equal(value.data.usageCount, 1);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.count, 2);
        assert.equal(value.data.relativeCount, 1);

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Digital Technologies Proximity Sensor payload and also not impact washroom usage", () => {
      const data = {
        state: {
          lastCount: 201,
          usage: 1,
          lastStatus: "PRESENT"
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

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.lastCount, 201);
        assert.equal(value.usage, 1);
        assert.equal(value.lastStatus, "NOT_PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "NOT_PRESENT");
        assert.equal(value.data.proximity, false);
        assert.equal(value.data.count, 201);
        assert.equal(value.data.relativeCount, 0);

        validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

  });
});
