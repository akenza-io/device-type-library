import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("MClimate Button uplink", () => {
  let defaultSchema = null;
  let configurationSchema = null;
  let consume = null;
  before(async () => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    defaultSchema = await loadSchema(`${__dirname}/default.schema.json`);
    configurationSchema = await loadSchema(
      `${__dirname}/configuration.schema.json`,
    );
  });

  function uplink(payloadHex) {
    return {
      data: {
        payloadHex,
      },
      device: {
        deviceId: "70B3D52DD3000003",
      },
      uplinkMetrics: {
        timestamp: "1670849361.1912086",
        port: 2,
        frameCountUp: 6,
        rssi: -90,
        snr: 7,
        sf: 7,
      },
    };
  }

  describe("consume()", () => {
    it("should decode MClimate Button payload", () => {
      const data = uplink("01db011a01");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.batteryVoltage, 3.352);
        assert.equal(value.data.buttonPressed, "SINGLE_PRESS");
        assert.equal(value.data.temperature, 28.2);
        assert.equal(value.data.thermistorOperational, true);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode MClimate Button command responses followed by a keepalive", () => {
      const data = uplink("B10001AA120204121101b000d200");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "default");
        assert.equal(value.data.batteryVoltage, 3.008);
        assert.equal(value.data.buttonPressed, "NO_PRESS");
        assert.equal(value.data.temperature, 21);
        assert.equal(value.data.thermistorOperational, true);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.singlePressEventCounter, 426);
        assert.equal(value.data.keepAliveTime, 2);
        assert.equal(value.data.hardwareVersion, 12);
        assert.equal(value.data.softwareVersion, 11);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode a MClimate Button command response without keepalive", () => {
      const data = uplink("1f01");

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.equal(value.topic, "configuration");
        assert.equal(value.data.sendEventLater, 1);

        validateSchema(value.data, configurationSchema, { throwError: true });
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("01db");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 01db");
      });

      consume(data);
    });
  });
});
