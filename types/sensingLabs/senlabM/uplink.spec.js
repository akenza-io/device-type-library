import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Senlab SenlabM uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let systemSchema = null;
  let lifecycleSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    systemSchema = loadSchema(`${import.meta.dirname}/system.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode Senlab SenlabM payload", () => {
      const data = {
        state: {},
        data: {
          port: 1,
          payloadHex: "00797f10a080d5b3704d0201000107080708000f01",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");
      });

      expectSample("system", systemSchema, (data) => {
        assert.equal(data.appType, "SENLABM");
        assert.equal(data.firmwareVersion, "2.1.0");
        assert.equal(data.functionMode, "BASIC");
        assert.equal(data.logPeriod, 3600);
        assert.equal(data.randWindow, 15);
        assert.equal(data.redundancyFactor, 1);
        assert.equal(data.txPeriod, 3600);
      });

      consume(data);
    });

    it("Should decode Senlab SenlabM payload & state init", () => {
      const data = {
        state: {},
        device: {
          customFields: {
            pulseType: "kwh",
            divider: 100,
          },
        },
        data: {
          port: 3,
          payloadHex: "02f98e0f9c1000000f57",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse, 3927);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.relativePulse, 0);
        assert.equal(value.data.kwh, 39.27);
        assert.equal(value.data.pulse, 3927);

        // utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 98);
      });

      consume(data);
    });

    it("Should decode Senlab SenlabM payload & generate new pulse", () => {
      const data = {
        state: { lastPulse: 3000 },
        device: {
          customFields: {
            pulseType: "kwh",
            divider: 100,
          },
        },
        data: {
          port: 3,
          payloadHex: "02f98e0f9c1000000f57",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.typeOf(value, "object");

        assert.equal(value.lastPulse, 3927);
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.pulse, 3927);
        assert.equal(value.data.relativePulse, 927);
        assert.equal(value.data.kwh, 39.27);

        // utils.validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 98);
      });

      consume(data);
    });
  });
});
