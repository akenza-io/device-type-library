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

describe("Sensocon DataSling Series WM Uplink", () => {
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
    it("should decode a WM-DP02-HT02-TI01 uplink (field data)", () => {
      // Real uplink of a WM-DP02-HT02-TI01 (FCnt 0, FPort 1, US915)
      expectSample("humidity", { humidity: 90.608, humidityTemp: 80.73 });
      expectSample("temperature", { temperature: 41.9 });
      expectSample("lifecycle", { batteryVoltage: 3.025, payloadVersion: 170 });
      consume({
        data: {
          port: 1,
          payloadHex: "aa039a99414001d475a142023837b542089a992742",
        },
      });
    });

    it("should decode the SD-0178 example payload", () => {
      // Example payload printed in Sensocon document SD-0178 (no battery block)
      expectSample("pressure", { pressure: 2.95 });
      expectSample("humidity", { humidity: 59.439, humidityTemp: 79.632 });
      expectSample("current", { current: 4 }); // 4 mA, 4-20 mA input
      consume({
        data: {
          port: 1,
          payloadHex: "aa00a3cc3c4002a0c16d42019a439f420700008040",
        },
      });
    });

    it("should decode a WM with pressure, gauge pressure and probe temperature", () => {
      // Constructed test vector in the SD-0178 format
      expectSample("pressure", { pressure: 0.5 });
      expectSample("gauge_diff_pressure", { gaugeDiffPressure: 12.5 });
      expectSample("temperature", { temperature: 72.5 });
      expectSample("lifecycle", { batteryVoltage: 3.05, payloadVersion: 170 });
      consume({
        data: {
          port: 1,
          payloadHex: "aa0333334340000000003f13000048410800009142",
        },
      });
    });

    it("should decode a closed contact payload", () => {
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

    it("should decode the field uplink from a ChirpStack v4 event (Base64)", () => {
      expectSample("humidity", { humidity: 90.608, humidityTemp: 80.73 });
      expectSample("temperature", { temperature: 41.9 });
      expectSample("lifecycle", { batteryVoltage: 3.025, payloadVersion: 170 });
      consume({ data: { fPort: 1, data: "qgOamUFAAdR1oUICODe1QgiamSdC" } });
    });

    it("should emit nothing for an empty payload", () => {
      consume({ data: { port: 1, payloadHex: "" } });
    });
  });
});
