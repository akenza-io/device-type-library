import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Clim'O Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "default",
      "input1",
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

  function expectState(state) {
    expectEmits((type, value) => {
      assert.equal(type, "state");
      assert.deepEqual(value, state);
    });
  }

  describe("consume()", () => {
    it("should decode the standard report containing temperature value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a04020000290b89" },
      };

      expectSample("default", { temperature: 29.53 });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing 2 short threshold alarms on temperature value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "118a0402000029075590b0b1" },
      };

      expectSample("default", { temperature: 18.77 });
      expectState({});

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
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing a long delta alarm on temperature value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "118a04020000290b35a0c80014" },
      };

      expectSample("default", { temperature: 28.69 });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing humidity value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a04050000210e89" },
      };

      expectSample("default", { humidity: 37.21 });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing state of case", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000f00551001" },
      };

      expectSample("tamper", { tamper: true });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing number of pulse detection on input 1", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000f04022300000000" },
      };

      expectSample("input1", { pulse: 0, relativePulse: 0 });
      expectState({ lastPulse1: 0 });

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
      expectState({});

      consume(data);
    });

    it("should decode the of read current value on cluster 0x0402", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "11010402000000290992" },
      };

      expectSample("default", { temperature: 24.5 });
      expectState({});

      consume(data);
    });

    it("should decode the containing a batch of values", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "362100808098c31ecb824d7b07ba3d" },
      };

      expectSample("lifecycle", { batteryVoltage: 3.707 }, 0);
      expectSample("default", { temperature: 28.7, humidity: 37 }, 1);
      expectState({});

      consume(data);
    });

    it("should decode the pulse count with customfields and state", () => {
      const data = {
        device: {
          customFields: {
            pulseType1: "water",
            multiplier1: 10,
            divider1: 1000,
          },
        },
        state: { lastPulse1: 4346 },
        data: { port: 125, payloadHex: "110a000f04022300001226" },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "input1");
        assert.deepEqual(value.data, {
          pulse: 4646,
          relativePulse: 300,
          water: 3,
          waterCumulative: 46.46,
        });
      });
      expectState({ lastPulse1: 4646 });

      consume(data);
    });
  });
});
