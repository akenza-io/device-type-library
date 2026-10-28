import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("MClimate HT uplink", () => {
  let defaultSchema = null;
  let configurationSchema = null;
  let consume = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    configurationSchema = loadSchema(`${import.meta.dirname}/configuration.schema.json`);
  });

  function uplink(payloadHex) {
    return {
      data: {
        payloadHex,
      },
      device: {
        deviceId: "70B3D52DD3000002",
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
    it("should decode MClimate HT payload", () => {
      const data = uplink("0102a16af60400");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 27.3);
        assert.equal(data.humidity, 41.41);
        assert.equal(data.batteryVoltage, 3.568);
        assert.equal(data.thermistorOperational, false);
        assert.notProperty(data, "extTemperature");
      });

      consume(data);
    });

    it("should decode the external thermistor of a MClimate HT payload", () => {
      const data = uplink("0102a16af60123");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.thermistorOperational, true);
        assert.equal(data.extTemperature, 29.1);
      });

      consume(data);
    });

    it("should decode MClimate HT command responses followed by a keepalive", () => {
      const data = uplink("34010332010304201512050102764DE90400");

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.temperature, 23);
        assert.equal(data.humidity, 30.08);
        assert.equal(data.batteryVoltage, 3.464);
        assert.equal(data.thermistorOperational, false);
      });

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.humidityCompensation, -3);
        assert.equal(data.temperatureCompensation, -0.3);
        assert.equal(data.hardwareVersion, 20);
        assert.equal(data.softwareVersion, 15);
        assert.equal(data.keepAliveTime, 5);
      });

      consume(data);
    });

    it("should decode a MClimate HT command response without keepalive", () => {
      const data = uplink("AA01");

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.d2dCommunicationState, true);
      });

      consume(data);
    });

    it("should log an error if the payload cannot be decoded", () => {
      const data = uplink("01");

      expectEmits((type, value) => {
        assert.equal(type, "log");
        assert.equal(value.error, "Unknown payload 01");
      });

      consume(data);
    });
  });
});
