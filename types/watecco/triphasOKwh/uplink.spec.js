import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Triphas'O kWh Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "input1",
      "pin_state",
      "phase_a",
      "phase_a_variables",
      "phase_abc",
      "phase_b",
      "phase_b_variables",
      "phase_c",
      "phase_c_variables",
      "energy",
      "power",
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

    it("should decode the standard report containing output on", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000600001001" },
      };

      expectSample("output", { output: true });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing output off", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a000600001000" },
      };

      expectSample("output", { output: false });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing energy/power value", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "710a800a000041200003a96a00000000000092990000705000007c7f00000000000000c000000f6f",
        },
      };

      expectSample("phase_abc", {
        positiveActiveEnergy: 239978,
        negativeActiveEnergy: 0,
        positiveReactiveEnergy: 37529,
        negativeReactiveEnergy: 28752,
        positiveActivePower: 31871,
        negativeActivePower: 0,
        positiveReactivePower: 192,
        negativeReactivePower: 3951,
      });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing energy/power long threshold alarm", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "118a800a000041200010760a0000020400005a6e000a210d000018a20000000000000000000003a6a0b1060000000f0000000002",
        },
      };

      expectSample("phase_a", {
        positiveActiveEnergy: 1078794,
        negativeActiveEnergy: 516,
        positiveReactiveEnergy: 23150,
        negativeReactiveEnergy: 663821,
        positiveActivePower: 6306,
        negativeActivePower: 0,
        positiveReactivePower: 0,
        negativeReactivePower: 934,
      });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing volt, amp, and phase value", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "110a800b00004106094c030e0163" },
      };

      expectSample("phase_a_variables", { vrms: 238, irms: 78.2, angle: 355 });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing short threshold alarm", () => {
      const data = {
        state: {},
        data: { port: 125, payloadHex: "310a800b000041060973010d01629050" },
      };

      expectSample("phase_b_variables", {
        vrms: 241.9,
        irms: 26.9,
        angle: 354,
      });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing voltage/current long threshold alarm", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "118a800b00004106097801150162a0500003e8000001d1010032000001",
        },
      };

      expectSample("phase_a_variables", {
        vrms: 242.4,
        irms: 27.7,
        angle: 354,
      });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing energy report of the 3 phases", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "110a8010000041200000010000000200000003000000040000000500000006000000070000000800",
        },
      };

      expectSample("energy", {
        activeEnergyA: 256,
        reactiveEnergyA: 512,
        activeEnergyB: 768,
        reactiveEnergyB: 1024,
        activeEnergyC: 1280,
        reactiveEnergyC: 1536,
        activeEnergyABC: 1792,
        reactiveEnergyABC: 2048,
      });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing power report of the 3 phases", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "110a80100001412000001843fffffc20000024cafffff50f00001f35fffff42a00005c42ffffe559a050000000003200000001015100000000140000000001",
        },
      };

      expectSample("power", {
        activePowerA: 6211,
        reactivePowerA: -992,
        activePowerB: 9418,
        reactivePowerB: -2801,
        activePowerC: 7989,
        reactivePowerC: -3030,
        activePowerABC: 23618,
        reactivePowerABC: -6823,
      });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing voltage/current report of the 3 phases", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "110a800d0000411208a10052000308a20042004008a300320030",
        },
      };

      expectSample("phase_a_variables", { vrms: 220.9, irms: 8.2, angle: 3 });
      expectSample("phase_b_variables", { vrms: 221, irms: 6.6, angle: 64 });
      expectSample("phase_c_variables", { vrms: 221.1, irms: 5, angle: 48 });
      expectState({});

      consume(data);
    });

    it("should decode the standard report containing voltage/current long threshold alarm of the 3 phases", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "118a800d000041120975010c01610974015e0153098301610150a0d0000032000001d1010005000001b208015e000001",
        },
      };

      expectSample("phase_a_variables", {
        vrms: 242.1,
        irms: 26.8,
        angle: 353,
      });
      expectSample("phase_b_variables", { vrms: 242, irms: 35, angle: 339 });
      expectSample("phase_c_variables", {
        vrms: 243.5,
        irms: 35.3,
        angle: 336,
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
