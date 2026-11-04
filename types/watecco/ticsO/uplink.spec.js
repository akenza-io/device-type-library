import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Watecco Tics'O Uplink", () => {
  let consume = null;
  const schemas = {};
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);

    const topics = [
      "default",
      "tic_cbe",
      "tic_cje",
      "tic_ice",
      "tic_ice_p",
      "tic_ice_p1",
      "tic_pmepmi",
      "tic_std",
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

    it("should decode the payload:110A005601004113240205144515040C0A09210001968200F17FC5", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "110a005601004113240205144515040c0a09210001968200f17fc5",
        },
      };

      expectSample("tic_std", {
        DATE: "21/04/12 10:09:33",
        DATESeason: "E",
        EAST: 104066,
        EAIT: 15826885,
      });

      consume(data);
    });

    it("should decode the payload:110a00540000410c0000000000000040242d0e6a", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "110a00540000410c0000000000000040242d0e6a",
        },
      };

      expectSample("tic_cbe", { BASE: 606932586 });

      consume(data);
    });

    it("should decode the payload:110a005700004115650328292a0c0415093b3527f7e5a0000004064410", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "110a005700004115650328292a0c0415093b3527f7e5a0000004064410",
        },
      };

      expectSample("tic_pmepmi", {
        DATE: "12/04/21 09:59:53",
        DebP: "2021-04-01T02:00:00.000Z",
        EAPs: 4,
        EAPi: 410640,
      });

      consume(data);
    });

    it("should decode the payload:110a0056010041170410003445140a0313000283494e440000462c00233f4c", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "110a0056010041170410003445140a0313000283494e440000462c00233f4c",
        },
      };

      expectSample("tic_std", {
        DATE: "20/10/03 19:00:02",
        DATESeason: "E",
        LTARF: "IND",
        EAST: 17964,
        EAIT: 2309964,
      });

      consume(data);
    });

    it("should decode the payload:110a0056010041132402051445140a180525190001a81401cd4593", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "110a0056010041132402051445140a180525190001a81401cd4593",
        },
      };

      expectSample("tic_std", {
        DATE: "20/10/24 05:37:25",
        DATESeason: "E",
        EAST: 108564,
        EAIT: 30229907,
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

    it("should decode the standard report containing General (TGPHI only) data", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex: "110a00530000410c00000800000000003f147ae1",
        },
      };

      expectSample("tic_ice", { TGPHI: 0.58 });

      consume(data);
    });

    it("should decode the standard report containing ICEp data", () => {
      const data = {
        state: {},
        data: {
          port: 125,
          payloadHex:
            "110a00530001412c0000000000007ad90106190200001306190a30050f67974ca1ed37bd430000000000008550a55280e5000000",
        },
      };

      expectSample("tic_ice_p", {
        DEBUTp: "01/06/25 02:00:00",
        DATEEAp: "19/06/25 10:48:05",
        EApP: 1009559,
        EApHCE: 5022189,
        EApHCH: 3652931,
        EApHCD: 0,
        EApJA: 0,
        EApHPE: 8736933,
        EApHPH: 5406949,
        EApHPD: 0,
      });

      consume(data);
    });
  });
});
