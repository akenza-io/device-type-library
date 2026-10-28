import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Digital Technologies CO2 Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let co2Schema = null;
  let pressureSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    co2Schema = loadSchema(`${import.meta.dirname}/co2.schema.json`);
    pressureSchema = loadSchema(`${import.meta.dirname}/pressure.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Digital Technologies CO2 Sensor default payload", () => {
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

    it("should decode the Digital Technologies CO2 Sensor pressure payload", () => {
      const data = {
        eventId: "ccq59scod7p9hifmsejg",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/c9j6jmcqo1dg009fnko0",
        eventType: "pressure",
        data: {
          eventType: "pressure",
          pressure: {
            pascal: 94936,
            updateTime: "2022-09-28T14:06:41.604000Z",
          },
        },
        timestamp: "2022-09-28T14:06:41.604000Z",
      };
      expectSample("pressure", pressureSchema, (data) => {
        assert.equal(data.pressure, 94936);
      });

      consume(data);
    });

    it("should decode the Digital Technologies CO2 Sensor co2 payload", () => {
      const data = {
        eventId: "ccq59sai00c8sop2iqog",
        targetName:
          "projects/c3t7p26j4a2g00de1sng/devices/c9j6jmcqo1dg009fnko0",
        eventType: "co2",
        data: {
          eventType: "co2",
          co2: {
            ppm: 617,
            updateTime: "2022-09-28T14:06:41.604000Z",
          },
        },
        timestamp: "2022-09-28T14:06:41.604000Z",
      };

      expectSample("co2", co2Schema, (data) => {
        assert.equal(data.co2, 617);
      });

      consume(data);
    });
  });
});
