import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOPICS = [
  "pressure",
  "gauge_diff_pressure",
  "humidity",
  "temperature",
  "voltage",
  "current",
  "contact",
  "lifecycle",
];

describe("Sensocon DataSling Series WS Uplink", () => {
  const schemas = {};
  let consume = null;

  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    await Promise.all(
      TOPICS.map(async (topic) => {
        schemas[topic] = await loadSchema(`${__dirname}/${topic}.schema.json`);
      }),
    );
  });

  // Queues one expected emit: checks the topic, the values and the schema
  function expectSample(topic, expected) {
    expectEmits((type, value) => {
      assert.equal(type, "sample");
      assert.isNotNull(value);
      assert.typeOf(value.data, "object");
      assert.equal(value.topic, topic);
      assert.deepEqual(
        Object.keys(value.data).sort(),
        Object.keys(expected).sort(),
      );
      Object.keys(expected).forEach((key) => {
        if (expected[key] === null) {
          assert.isNull(value.data[key]);
        } else if (typeof expected[key] === "string") {
          assert.equal(value.data[key], expected[key]);
        } else {
          assert.closeTo(value.data[key], expected[key], 0.0005);
        }
      });
      if (!Object.values(value.data).includes(null)) {
        validateSchema(value.data, schemas[topic], { throwError: true });
      }
    });
  }

  describe("consume()", () => {
    it("should decode a WS-HT humidity and temperature payload", () => {
      // Example payload from the Sensocon akenza integration manual
      expectSample("humidity", { humidity: 57.728, humidityTemp: 75.885 });
      expectSample("lifecycle", { batteryVoltage: 3.085, payloadVersion: 170 });
      consume({
        data: { port: 1, payloadHex: "aa03a4704540012ac597420267e96642" },
      });
    });

    it("should decode the same payload from a ChirpStack v4 event (Base64)", () => {
      expectSample("humidity", { humidity: 57.728, humidityTemp: 75.885 });
      expectSample("lifecycle", { batteryVoltage: 3.085, payloadVersion: 170 });
      consume({ data: { fPort: 1, data: "qgOkcEVAASrFl0ICZ+lmQg==" } });
    });

    // The following payloads are constructed test vectors in the SD-0178 format
    it("should decode a WS-DP differential pressure payload", () => {
      expectSample("pressure", { pressure: 0.25 });
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa0366664640000000803e" } });
    });

    it("should decode a gauge pressure payload", () => {
      expectSample("gauge_diff_pressure", { gaugeDiffPressure: 12.5 });
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa03666646401300004841" } });
    });

    it("should decode a WS-TI probe temperature payload", () => {
      expectSample("temperature", { temperature: 72.5 });
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa03666646400800009142" } });
    });

    it("should decode a WS-VI voltage input payload", () => {
      expectSample("voltage", { voltage: 5 });
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa0366664640060000a040" } });
    });

    it("should decode a WS-AI current input payload", () => {
      // 4-20 mA input, unit is mA
      expectSample("current", { current: 12 });
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa03666646400700004041" } });
    });

    it("should decode a WS-CI closed contact payload", () => {
      // 1 = closed. A closed contact triggers a transmission.
      expectSample("contact", { contact: "CLOSED" });
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa0366664640040000803f" } });
    });

    it("should decode an open contact payload", () => {
      // 0 = open
      expectSample("contact", { contact: "OPEN" });
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa03666646400400000000" } });
    });

    it("should ignore types without a specified unit", () => {
      expectSample("lifecycle", { batteryVoltage: 3.1, payloadVersion: 170 });
      consume({ data: { port: 1, payloadHex: "aa0366664640050000c03f" } });
    });

    it("should emit null for a missing key of a topic", () => {
      // Humidity block only (no humidity sensor temperature, no battery)
      expectSample("humidity", { humidity: 57.728, humidityTemp: null });
      consume({ data: { port: 1, payloadHex: "aa0267e96642" } });
    });

    it("should emit nothing for an empty payload", () => {
      consume({ data: { port: 1, payloadHex: "" } });
    });
  });
});
