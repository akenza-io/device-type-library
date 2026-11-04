import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Vaqa'O Lite Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "default",
      "occupancy",
      "tamper",
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
    it("should decode the standard report containing temperature value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a04020000290b89" },
      };

      expectSample("default", { temperature: 29.53 });

      consume(data);
    });

    it("should decode the standard report containing humidity value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a04050000210e89" },
      };

      expectSample("default", { humidity: 37.21 });

      consume(data);
    });

    it("should decode the standard report containing IAQ value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a800c0000210019" },
      };

      expectSample("default", { iaq: 25 });

      consume(data);
    });

    it("should decode the standard report containing state the case", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000f00551001" },
      };

      expectSample("tamper", { tamper: true });

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

    it("should decode the batch report containing temperature, humidity and CO2", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "30b200b6e7c7004d8887202fda75b914b4b28276cbf26e59bb5bd6ed96e5ddb2948076cb9200f6",
        },
      };

      expectSample("default", { co2: 410 }, 0);
      expectSample("default", { temperature: 22.9 }, 10);
      expectSample("default", { co2: 420 }, 600);
      expectSample("default", { temperature: 22.8 }, 610);
      expectSample("default", { co2: 440 }, 1200);
      expectSample("default", { co2: 420 }, 1800);
      expectSample("default", { co2: 430 }, 2400);
      expectSample("default", { co2: 420 }, 3000);
      expectSample("default", { humidity: 53 }, 3010);

      consume(data);
    });

    it("should decode the batch report containing all measurements", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "70060000e2760090cfc0015b028423fb03272919804c121c003ebc5bd6895f0040000b68b72c27a0ddb4dc8076db920c68b72c19605b04",
        },
      };

      expectSample("occupancy", { occupied: false }, 0);
      expectSample("default", { humidity: 31 }, 14);
      expectSample("default", { temperature: 18.7, co2: 450 }, 15);
      expectSample("default", { illuminance: 50 }, 103);
      expectSample("default", { iaq: 240 }, 222);
      expectSample("default", { co2: 470 }, 615);
      expectSample("default", { temperature: 18.5 }, 616);
      expectSample("default", { illuminance: 160 }, 705);
      expectSample("default", { iaq: 250, pressure: 1011 }, 822);

      consume(data);
    });
  });
});
