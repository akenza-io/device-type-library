

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Verge Sense Uplink", () => {
  let spaceAvailabilitySchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/space_availability.schema.json`)
      .then((parsedSchema) => {
        spaceAvailabilitySchema = parsedSchema;
        done();
      });
  });

  let occupancySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/occupancy.schema.json`)
      .then((parsedSchema) => {
        occupancySchema = parsedSchema;
        done();
      });
  });

  let areaCountReportSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/area_count.schema.json`)
      .then((parsedSchema) => {
        areaCountReportSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Verge Sense space report payload && init state", () => {
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, false);
        assert.equal(value.data.occupied, 0);

        validateSchema(value.data, occupancySchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        // assert.equal(value.lastEmittedAt, now);
        assert.equal(value.lastOccupied, "UNOCCUPIED");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "area_count");
        assert.equal(value.data.peopleCount, 0);
        assert.equal(value.data.signsOfLife, false);

        validateSchema(value.data, areaCountReportSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Verge Sense space availability payload", () => {
      const data = {
        state: {
          lastEmittedAt: new Date().getTime() - 3600001,
          lastOccupied: "UNOCCUPIED"
        },
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "occupancy");
        assert.equal(value.data.occupancy, 1);
        assert.equal(value.data.occupied, true);

        validateSchema(value.data, occupancySchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        // assert.equal(value.lastEmittedAt, new Date().getTime());
        assert.equal(value.lastOccupied, "OCCUPIED");
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "space_availability");
        assert.equal(value.data.state, "OCCUPIED");

        validateSchema(value.data, spaceAvailabilitySchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
