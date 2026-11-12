import { assert } from "chai";
import rewire from "rewire";
import { init, expectEmits } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Sensocon DataSling Series WS Downlink", () => {
  let consume = null;

  before(() => {
    const script = rewire(`${__dirname}/downlink.js`);
    consume = init(script);
  });

  function expectDownlink(payloadHex, port = 1) {
    expectEmits((type, value) => {
      assert.equal(type, "downlink");
      assert.equal(value.payloadHex, payloadHex);
      assert.equal(value.port, port);
      assert.equal(value.confirmed, false);
    });
  }

  function expectLog() {
    expectEmits((type, value) => {
      assert.equal(type, "log");
      assert.isString(value.error);
    });
  }

  describe("consume()", () => {
    it("should encode a 20 minute interval (SD-0178 command 0x00)", () => {
      expectDownlink("000204b0");
      consume({ payload: { setInterval: 1200 } });
    });

    it("should encode the SD-0178 interval example (900 s)", () => {
      expectDownlink("00020384");
      consume({ payload: { setInterval: 900 } });
    });

    it("should encode the SD-0178 pressure offset example (+0.1 in. WC)", () => {
      expectDownlink("02020064");
      consume({ payload: { pressureOffset: 0.1 } });
    });

    it("should encode the other offsets", () => {
      expectDownlink("060207d0");
      consume({ payload: { humidityOffset: 2 } });
      expectDownlink("0c0201f4");
      consume({ payload: { humidityTempOffset: 0.5 } });
      expectDownlink("080200c8");
      consume({ payload: { voltageOffset: 0.2 } });
      expectDownlink("0a02000a");
      consume({ payload: { currentOffset: 0.01 } });
      expectDownlink("10020032");
      consume({ payload: { gaugeDiffPressureOffset: 0.05 } });
    });

    it("should encode a negative offset as two's complement", () => {
      expectDownlink("0402fe0c");
      consume({ payload: { temperatureOffset: -0.5 } });
    });

    it("should use the port from the event", () => {
      expectDownlink("000204b0", 2);
      consume({ port: 2, payload: { setInterval: 1200 } });
    });

    it("should forward a raw payloadHex", () => {
      expectDownlink("00020e10");
      consume({ payloadHex: "00020e10" });
    });

    it("should reject an interval below 10 minutes", () => {
      expectLog();
      consume({ payload: { setInterval: 300 } });
    });

    it("should reject an offset out of range", () => {
      expectLog();
      consume({ payload: { pressureOffset: 40 } });
    });

    it("should reject an unknown command", () => {
      expectLog();
      consume({ payload: { foo: 1 } });
    });
  });
});
