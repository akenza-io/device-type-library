const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("Verge Sense Uplink", () => {
  let spaceAvailabilitySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/space_availability.schema.json`)
      .then((parsedSchema) => {
        spaceAvailabilitySchema = parsedSchema;
        done();
      });
  });

  let occupancySchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  let areaCountReportSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/area_count.schema.json`)
      .then((parsedSchema) => {
        areaCountReportSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Verge Sense space report payload", () => {
      const data = {
        data: {
          "building_ref_id": "EA21",
          "floor_ref_id": "0070",
          "space_ref_id": "EG7859.43",
          "space_id": 602439,
          "sensor_ids": [
            "30Z-R9E",
            "30Z-SNE"
          ],
          "person_count": 0,
          "signs_of_life": false,
          "motion_detected": false,
          "event_type": "space_report",
          "timestamp": "2024-11-21T13:31:45.000Z",
          "people": {
            "count": 0,
            "distances": {
              "values": [],
              "units": "meters"
            },
            "coordinates": []
          }
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "area_count");
        assert.equal(value.data.peopleCount, 0);

        utils.validateSchema(value.data, areaCountReportSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Verge Sense space availability payload", () => {
      const data = {
        data: {
          "motion_detected": null,
          "building_ref_id": "EA21",
          "people": null,
          "environment": null,
          "signs_of_life": null,
          "event_type": "space_availability",
          "space_ref_id": "EG7859.43",
          "state": "occupied",
          "sensor_ids": [
            "30Z-R9E",
            "30Z-SNE"
          ],
          "space_id": 602439,
          "person_count": null,
          "floor_ref_id": "0070",
          "timestamp": "2024-11-21T13:37:45Z"
        }
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 2);
        assert.equal(value.data.occupied, true);

        utils.validateSchema(value.data, occupancySchema, {
          throwError: true,
        });
      });

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "space_availability");
        assert.equal(value.data.state, "OCCUPIED");

        utils.validateSchema(value.data, spaceAvailabilitySchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
