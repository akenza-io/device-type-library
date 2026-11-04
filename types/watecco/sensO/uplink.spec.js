import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Pulse Sens'O Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "input1",
      "input2",
      "input3",
      "pin_state",
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
    it("should decode the standard report containing state of pin 1", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000f00551001" },
      };

      expectSample("pin_state", { pinState1: true });
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

    it("should decode the standard report containing 3 state values", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a80050000190371" },
      };

      expectSample("pin_state", {
        pinState1: true,
        pinState2: false,
        pinState3: false,
      });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing firmware version", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110100000002000d0305020015e2" },
      };

      expectSample("configuration", { firmwareVersion: "3.5.2.5602" });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing battery charge", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a00500006410503040e6804" },
      };

      expectSample("lifecycle", { batteryVoltage: 3.688 });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing dataup info", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110180040000000800" },
      };

      expectSample("configuration", { messageType: "UNCONFIRMED" });
      expectState({});

      consume(data);
    });

    it("should decode the batch report", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "3203032cd2dc00000000117b02000080903d005000401040801d11604704d8119024912492247b",
        },
      };

      expectSample("input1", { pulse: 0, relativePulse: 0 }, 0);
      expectSample("input2", { pulse: 67108864, relativePulse: 0 }, 0);
      expectSample("input3", { pulse: 4194560, relativePulse: 0 }, 0);
      expectSample("input1", { pulse: 0, relativePulse: 0 }, 3600);
      expectSample("input2", { pulse: 67108864, relativePulse: 0 }, 3600);
      expectSample("input3", { pulse: 4194560, relativePulse: 0 }, 3600);
      expectSample("input1", { pulse: 0, relativePulse: 0 }, 7200);
      expectSample("input2", { pulse: 67108864, relativePulse: 0 }, 7200);
      expectSample("input3", { pulse: 4194560, relativePulse: 0 }, 7200);
      expectSample("input1", { pulse: 0, relativePulse: 0 }, 10800);
      expectSample("input2", { pulse: 67108864, relativePulse: 0 }, 10800);
      expectSample("input3", { pulse: 4194560, relativePulse: 0 }, 10800);
      expectState({ lastPulse1: 0, lastPulse2: 67108864, lastPulse3: 4194560 });

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
