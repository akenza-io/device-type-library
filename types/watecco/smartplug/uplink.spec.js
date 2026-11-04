import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Smartplug Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "default",
      "voltage_quality",
      "output",
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
    it("should decode the standard report containing output on", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000600001001" },
      };

      expectSample("output", { output: true });

      consume(data);
    });

    it("should decode the standard report containing output off", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000600001000" },
      };

      expectSample("output", { output: false });

      consume(data);
    });

    it("should decode the standard report containing simple metering", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "310a00520000410c000047ffffbe0063002fffd6",
        },
      };

      expectSample("default", {
        activeEnergy: 71,
        reactiveEnergy: -66,
        sampleCount: 99,
        activePower: 47,
        reactivePower: -42,
      });

      consume(data);
    });

    it("should decode the standard report containing power quality", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "310a80520000411822221111ffff000100000003001100002222000100020003",
        },
      };

      expectSample("voltage_quality", {
        frequency: 30.97,
        frequencyMin: 26.601,
        frequencyMax: 22.231,
        vrms: 0.1,
        vrmsMin: 0,
        vrmsMax: 0.3,
        vpeak: 1.7,
        vpeakMin: 0,
        vpeakMax: 873.8,
        overVoltage: 1,
        sagVoltage: 2,
        brownoutNumber: 3,
      });

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

    it("should decode the standard report containing dataup info", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110180040000000800" },
      };

      expectSample("configuration", { messageType: "UNCONFIRMED" });

      consume(data);
    });

    it("should decode the batch report", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "100180e3c61800202614b45b16bb65b15b16bb65b15b1613",
        },
      };

      expectSample("default", { activeEnergy: 49 }, 0);
      expectSample("default", { activeEnergy: 49 }, 600);
      expectSample("default", { activeEnergy: 49 }, 1200);
      expectSample("default", { activeEnergy: 49 }, 1800);
      expectSample("default", { activeEnergy: 49 }, 2400);
      expectSample("default", { activeEnergy: 49 }, 3000);

      consume(data);
    });
  });
});
