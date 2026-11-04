import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Fissur'O Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "default",
      "lifecycle",
      "configuration",
      "reporting_configuration",
    ];
    for (const topic of topics) {
      schemas[topic] = await loadSchema(`${__dirname}/${topic}.schema.json`);
    }
  });

  // Timestamp of the first sample of a batch, the others are compared to it
  let firstTimestamp = null;
  beforeEach(() => {
    firstTimestamp = null;
  });

  function expectSample(topic, data, offsetSeconds) {
    expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.equal(value.topic, topic);
      assert.deepEqual(value.data, data);

      if (offsetSeconds !== undefined) {
        const timestamp = new Date(value.timestamp).getTime();
        if (firstTimestamp === null) {
          firstTimestamp = timestamp;
        }
        assert.equal(timestamp - firstTimestamp, offsetSeconds * 1000);
      }

      validateSchema(value.data, schemas[topic], { throwError: true });
    });
  }

  describe("consume()", () => {
    it("should decode the standard report containing Tilt angle value (AnalogInput EP0)", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000c00553941500000" },
      };

      expectSample("default", { tilt: 13 });

      consume(data);
    });

    it("should decode the standard report containing distance value (AnalogInput EP1)", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "310a000c00553941500000" },
      };

      expectSample("default", { distance: 13 });

      consume(data);
    });

    it("should decode the standard report containing temperature value (Temperature EP1)", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "310a040200002909c4" },
      };

      expectSample("default", { temperature: 25 });

      consume(data);
    });

    it("should decode the standard report containing firmware version", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110100000002000d0305020015e2" },
      };

      expectSample("configuration", { firmwareVersion: "3.5.2.5602" });

      consume(data);
    });

    it("should decode the standard report containing battery charge", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a00500006410503040e6804" },
      };

      expectSample("lifecycle", { batteryVoltage: 3.688 });

      consume(data);
    });

    it("should decode the standard report containing dataup info", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110180040000000800" },
      };

      expectSample("configuration", { messageType: "UNCONFIRMED" });

      consume(data);
    });

    it("should decode the batch report containing Tilt, distance, temperature and battery_voltage", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "4630000040030339fb1e66e6e6f600000000ee110813",
        },
      };

      expectSample("default", { tilt: 0.1, distance: 0, temperature: 21.8 }, 0);
      expectSample("lifecycle", { batteryVoltage: 3.3 }, 0);

      consume(data);
    });
  });
});
