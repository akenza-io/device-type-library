const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Digital Technologies Desk Sensor Uplink", () => {
  let occupancySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils.loadSchema(`${__dirname}/occupancy.schema.json`).then((parsedSchema) => {
      occupancySchema = parsedSchema;
      done();
    });
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies Desk Sensor payload", () => {
      const data = {
        "eventId": "d0e65nj064uc73c2jcvg",
        "targetName": "projects/d0cv6cco848c73ajtmv0/devices/cj5jpe7r23r0008c1pmg",
        "eventType": "deskOccupancy",
        "data": {
          "deskOccupancy": {
            "state": "OCCUPIED",
            "updateTime": "2025-05-08T07:53:02.000000Z",
            "remarks": []
          }
        },
        "timestamp": "2025-05-08T07:53:02.000000Z"
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupncy");
        assert.equal(value.data.occupied, true);
        assert.equal(value.data.occupancy, 2);

        utils.validateSchema(value.data, occupancySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
