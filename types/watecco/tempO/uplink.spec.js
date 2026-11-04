import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Temp'O Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "default",
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

    it("should decode the standard report containing 2 short threshold alarms on temperature value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "118a0402000029075590b0b1" },
      };

      expectSample("default", { temperature: 18.77 });

      consume(data);
    });

    it("should decode the standard report containing 3 long threshold alarms on temperature value", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "118a0402000029010ea0b008fc000001b10834000001b207d0000001",
        },
      };

      expectSample("default", { temperature: 2.7 });

      consume(data);
    });

    it("should decode the standard report containing a long delta alarm on temperature value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "118a04020000290b35a0c80014" },
      };

      expectSample("default", { temperature: 28.69 });

      consume(data);
    });

    it("should decode the standard report containing cmdID 0x07 response for temperature cluster", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "1107040200800000" },
      };

      expectSample("reporting_configuration", {
        clusterId: "0x0402",
        attributeId: "0x0000",
        status: 0,
        newModeConfiguration: true,
        causeRequest: "NONE",
        securedIfAlarm: false,
        secured: false,
        noHeaderPort: false,
        batch: false,
      });

      consume(data);
    });

    it("should decode the of read current value on cluster 0x0402", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "11010402000000290992" },
      };

      expectSample("default", { temperature: 24.5 });

      consume(data);
    });
  });
});
