import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Verge Sense Uplink", () => {
  let spaceAvailabilitySchema = null;
  let consume = null;
  let occupancySchema = null;
  let areaCountReportSchema = null;
  let sensorReportSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    spaceAvailabilitySchema = loadSchema(`${import.meta.dirname}/space_availability.schema.json`);
    occupancySchema = loadSchema(`${import.meta.dirname}/occupancy.schema.json`);
    areaCountReportSchema = loadSchema(`${import.meta.dirname}/area_count.schema.json`);
    sensorReportSchema = loadSchema(`${import.meta.dirname}/sensor_report.schema.json`);
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

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, false);
        assert.equal(data.occupied, 0);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        // assert.equal(value.lastEmittedAt, now);
        assert.equal(value.lastOccupied, "FREE");
      });

      expectSample("area_count", areaCountReportSchema, (data) => {
        assert.equal(data.peopleCount, 0);
        assert.equal(data.signsOfLife, false);
      });

      consume(data);
    });

    it("should decode the Verge Sense space availability payload", () => {
      const data = {
        state: {
          lastEmittedAt: new Date().getTime() - 3600001,
          lastOccupied: "FREE"
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

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, 1);
        assert.equal(data.occupied, true);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        // assert.equal(value.lastEmittedAt, new Date().getTime());
        assert.equal(value.lastOccupied, "OCCUPIED");
      });

      expectSample("space_availability", spaceAvailabilitySchema, (data) => {
        assert.equal(data.state, "OCCUPIED");
      });

      consume(data);
    });

    it("should decode the Verge Sense floor report", () => {
      const data = {
        data: {
          "motion_detected": null,
          "signs_of_life": null,
          "event_type": "space_report",
          "space_ref_id": null,
          "building_ref_id": "MM4",
          "sensor_ids": [
            "00:6E:02:01:F0:9C",
            "00:6E:02:05:E6:10",
            "00:6E:02:07:27:2C"
          ],
          "space_id": 820755,
          "person_count": 150,
          "people": {
            "count": 150,
            "coordinates": []
          },
          "floor_ref_id": "03",
          "timestamp": "2026-03-25T10:27:34.942Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });


      expectSample("area_count", areaCountReportSchema, (data) => {
        assert.equal(data.peopleCount, 150);
      });

      consume(data);
    });

    it("should decode the Verge Sense sensor report", () => {
      const data = {
        data: {
          "building_ref_id": "SYLE",
          "event_type": "sensor_report",
          "floor_ref_id": "23",
          "person_count": 0,
          "sensor_id": "3BE-4NZ",
          "signs_of_life": false,
          "space_ref_id": "23. C0.010",
          "timestamp": "2026-04-08T16:44:13.000Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });


      expectSample("sensor_report", sensorReportSchema, (data) => {
        assert.equal(data.signsOfLife, false);
      });

      consume(data);
    });

    it("should repeate the Verge Sense space availability payload", () => {
      const data = {
        state: {
          lastHour: new Date().getHours() - 1,
          lastOccupied: "FREE"
        },
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

      expectSample("occupancy", occupancySchema, (data) => {
        assert.equal(data.occupancy, 0);
        assert.equal(data.occupied, false);
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);

        assert.exists(value.lastEmittedAt);
        assert.equal(value.lastOccupied, "FREE");
        assert.equal(value.lastHour, new Date().getHours());
      });

      expectSample("area_count", areaCountReportSchema, (data) => {
        assert.equal(data.peopleCount, 0);
        assert.equal(data.signsOfLife, false);
      });

      consume(data);
    });
  });
});
