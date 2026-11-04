import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Inclin'O Uplink", () => {
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
    it("should decode the standard report containing Tilt value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000c00553941500000" },
      };

      expectSample("default", { tilt: 13 });

      consume(data);
    });

    it("should decode the standard report containing occupancy value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a040600001801" },
      };

      expectSample("default", { occupancy: true });

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

    it("should decode the batch report", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "1002000080ad837582816e33c01db3ea91ed581ae21d31398b1d29f0f10eb11d10",
        },
      };

      expectSample("default", { acceleration: 2027 }, 0);
      expectSample("default", { acceleration: 1778 }, 10);
      expectSample("default", { acceleration: 13276 }, 15);
      expectSample("default", { acceleration: 1568 }, 58);
      expectSample("default", { acceleration: 19662 }, 64);
      expectSample("default", { acceleration: 2684 }, 71);
      expectSample("default", { acceleration: 7273 }, 77);

      consume(data);
    });
  });
});
