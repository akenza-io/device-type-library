import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Senlab SenlabM uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`).then((parsedSchema) => {
      defaultSchema = parsedSchema;
      done();
    });
  });

  let systemSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/system.schema.json`).then((parsedSchema) => {
      systemSchema = parsedSchema;
      done();
    });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`).then((parsedSchema) => {
      lifecycleSchema = parsedSchema;
      done();
    });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.appType, "SENLABM");
        assert.equal(value.data.firmwareVersion, "2.1.0");
        assert.equal(value.data.functionMode, "BASIC");
        assert.equal(value.data.logPeriod, 3600);
        assert.equal(value.data.randWindow, 15);
        assert.equal(value.data.redundancyFactor, 1);
        assert.equal(value.data.txPeriod, 3600);

        validateSchema(value.data, systemSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 98);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryLevel, 98);

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
