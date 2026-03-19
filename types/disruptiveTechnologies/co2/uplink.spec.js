

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Digital Technologies CO2 Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let co2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/co2.schema.json`).then((parsedSchema) => {
      co2Schema = parsedSchema;
      done();
    });
  });

  let pressureSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/pressure.schema.json`)
      .then((parsedSchema) => {
        pressureSchema = parsedSchema;
        done();
      });
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
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.temperature, 22.45);
        assert.equal(value.data.temperatureF, 72.41);
        assert.equal(value.data.humidity, 17);

        validateSchema(value.data, defaultSchema, { throwError: true });
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
      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "pressure");
        assert.equal(value.data.pressure, 94936);

        validateSchema(value.data, pressureSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "co2");
        assert.equal(value.data.co2, 617);

        validateSchema(value.data, co2Schema, { throwError: true });
      });

      consume(data);
    });
  });
});
