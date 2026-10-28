import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital Technologies Humidity Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies old default Sensor payload", () => {
      const data = {
        eventId: "c505kmuj0aoraraqu5g0",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/emuc4ah9r13um94o4pp3hdg",
        eventType: "humidity",
        data: {
          eventType: "humidity",
          humidity: {
            temperature: 22.45,
            relativeHumidity: 17,
            updateTime: "2021-05-16T06:13:46.369000Z",
          },
        },
        timestamp: "2021-09-14T08:16:27.517331Z",
        labels: { name: "Temperature Simulator" },
      };
      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 22.45);
        assert.equal(data.temperatureF, 72.41);
        assert.equal(data.humidity, 17);
      });

      consume(data);
    });

    it("should decode the Digital Technologies new multi sample Sensor payload", () => {
      const data = {
        data: {
          "humidity": {
            "temperature": 0,
            "relativeHumidity": 0,
            "samples": [
              {
                "temperature": 0,
                "relativeHumidity": 0,
                "sampleTime": "2025-06-20T12:21:28.128000Z"
              },
              {
                "temperature": 0.5,
                "relativeHumidity": 0.5,
                "sampleTime": "2025-06-20T12:18:28.128000Z"
              },
              {
                "temperature": 0.8,
                "relativeHumidity": 0.8,
                "sampleTime": "2025-06-20T12:15:28.128000Z"
              },
              {
                "temperature": 1,
                "relativeHumidity": 1,
                "sampleTime": "2025-06-20T12:12:28.128000Z"
              },
              {
                "temperature": 0.9,
                "relativeHumidity": 0.9,
                "sampleTime": "2025-06-20T12:09:28.128000Z"
              }
            ],
            "updateTime": "2025-06-20T12:21:28.128000Z",
            "isBackfilled": false
          },
          "eventType": "humidity",
          "labels": {
            "name": "Humidity Emulator"
          },
          "eventId": "",
          "targetName": ""
        }
      };

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 0);
        assert.equal(data.temperatureF, 32);
        assert.equal(data.humidity, 0);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 0.5);
        assert.equal(data.temperatureF, 32.9);
        assert.equal(data.humidity, 0.5);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 0.8);
        assert.equal(data.temperatureF, 33.44);
        assert.equal(data.humidity, 0.8);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 1);
        assert.equal(data.temperatureF, 33.8);
        assert.equal(data.humidity, 1);
      });

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 0.9);
        assert.equal(data.temperatureF, 33.62);
        assert.equal(data.humidity, 0.9);
      });

      consume(data);
    });
  });
});
