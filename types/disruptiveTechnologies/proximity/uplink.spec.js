const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Proximity Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/object_present.schema.json`)
      .then((parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      });
  });

  let touchSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/touch.schema.json`)
      .then((parsedSchema) => {
        touchSchema = parsedSchema;
        done();
      });
  });

  let washroomVisitSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/washroom_usage.schema.json`)
      .then((parsedSchema) => {
        washroomVisitSchema = parsedSchema;
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "NOT_PRESENT");
        assert.equal(value.data.proximity, false);
        assert.equal(value.data.count, 0);
        assert.equal(value.data.relativeCount, 0);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.count, 0);
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
          count: 0,
          lastStatus: "NOT_PRESENT",
          lastSampleEmittedAt: new Date().getTime()
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.count, 1);
        assert.equal(value.data.relativeCount, 1);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.count, 1);
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
          count: 1,
          lastStatus: "PRESENT",
          lastSampleEmittedAt: new Date().getTime() - 3600000
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "touch");
        assert.equal(value.data.touch, true);

        utils.validateSchema(value.data, touchSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.count, 1);
        assert.equal(value.data.relativeCount, 0); // Should stay 0 as this is not a real sample

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.count, 1);
        assert.equal(value.lastStatus, "PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });

    it("should decode the Digital Technologies Proximity Sensor payload and also count washroom usage", () => {
      const data = {
        state: {
          count: 200,
          usage: 0,
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.count, 201);
        assert.equal(value.data.relativeCount, 1);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.count, 201);
        assert.equal(value.usage, 1);
        assert.equal(value.lastStatus, "PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });

    it("should decode the Digital Technologies Proximity Sensor payload and also not impact washroom usage", () => {
      const data = {
        state: {
          count: 201,
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

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "NOT_PRESENT");
        assert.equal(value.data.proximity, false);
        assert.equal(value.data.count, 201);
        assert.equal(value.data.relativeCount, 0);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.count, 201);
        assert.equal(value.usage, 1);
        assert.equal(value.lastStatus, "NOT_PRESENT");
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });

    it("Check if the washroom visits counts up correctly", () => {
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
          count: 201,
          usage: 1,
          lastStatus: "NOT_PRESENT",
          lastSampleEmittedAt: new Date().getTime()
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "washroom_usage");
        assert.equal(value.data.absoluteUsageCount, 101);
        assert.equal(value.data.relativeUsageCount, 1);

        utils.validateSchema(value.data, washroomVisitSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "object_present");
        assert.equal(value.data.objectPresent, "PRESENT");
        assert.equal(value.data.proximity, true);
        assert.equal(value.data.count, 202);
        assert.equal(value.data.relativeCount, 1);

        utils.validateSchema(value.data, objectPresentSchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.equal(value.count, 202);
        assert.equal(value.lastStatus, "PRESENT");
        assert.equal(value.usage, 0);
        assert.isDefined(value.lastSampleEmittedAt);
      });

      consume(data);
    });
  });
});
