import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Move'O Lite Uplink", () => {
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

    it("should decode the standard report containing violation detection", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000f00551001" },
      };

      expectSample("tamper", { tamper: true });

      consume(data);
    });

    it("should decode the standard report containing illuminance value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a04000000210745" },
      };

      expectSample("default", { illuminance: 1861 });

      consume(data);
    });

    it("should decode the standard report containing occupancy value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a040600001801" },
      };

      expectSample("occupancy", { occupied: true });

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
  });
});
