import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Yosensi YO Relay Switch uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/battery_voltage.schema.json`).then(
      (parsedSchema) => {
        batteryVoltageSchema = parsedSchema;
        done();
      },
    );
  });

  let relayStateCH1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/relay_state_ch1.schema.json`).then(
      (parsedSchema) => {
        relayStateCH1Schema = parsedSchema;
        done();
      },
    );
  });

  let relayStateCH2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/relay_state_ch2.schema.json`).then(
      (parsedSchema) => {
        relayStateCH2Schema = parsedSchema;
        done();
      },
    );
  });

  let relayStateAllCHSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/relay_state_all_ch.schema.json`).then(
      (parsedSchema) => {
        relayStateAllCHSchema = parsedSchema;
        done();
      },
    );
  });

  let outputModeCH1Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/output_mode_ch1.schema.json`).then(
      (parsedSchema) => {
        outputModeCH1Schema = parsedSchema;
        done();
      },
    );
  });

  let outputModeCH2Schema = null;
  before((done) => {
    loadSchema(`${__dirname}/output_mode_ch2.schema.json`).then(
      (parsedSchema) => {
        outputModeCH2Schema = parsedSchema;
        done();
      },
    );
  });

  let outputModeAllCHSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/output_mode_all_ch.schema.json`).then(
      (parsedSchema) => {
        outputModeAllCHSchema = parsedSchema;
        done();
      },
    );
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Relay Switch (batteryVoltage,relayStateAllCH,outputModeAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "025400000800015e50040011ff0002640011ff0000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "battery_voltage");
        assert.equal(value.data.batteryVoltage, 24144);

        validateSchema(value.data, batteryVoltageSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "relay_state_all_ch");
        assert.equal(value.data.relayStateAllCH, 2);

        validateSchema(value.data, relayStateAllCHSchema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_mode_all_ch");
        assert.equal(value.data.outputModeAllCH, 0);

        validateSchema(value.data, outputModeAllCHSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (relayStateCH1,relayStateAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "024c00000400100000040011ff0002",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "relay_state_ch1");
        assert.equal(value.data.relayStateCH1, 0);

        validateSchema(value.data, relayStateCH1Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "relay_state_all_ch");
        assert.equal(value.data.relayStateAllCH, 2);

        validateSchema(value.data, relayStateAllCHSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (relayStateCH2,relayStateAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "024c00000400100101040011ff0002",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "relay_state_ch2");
        assert.equal(value.data.relayStateCH2, 1);

        validateSchema(value.data, relayStateCH2Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "relay_state_all_ch");
        assert.equal(value.data.relayStateAllCH, 2);

        validateSchema(value.data, relayStateAllCHSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (outputModeCH1,outputModeAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02a600006400100001640011ff0004",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_mode_ch1");
        assert.equal(value.data.outputModeCH1, 1);

        validateSchema(value.data, outputModeCH1Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_mode_all_ch");
        assert.equal(value.data.outputModeAllCH, 4);

        validateSchema(value.data, outputModeAllCHSchema, {
          throwError: true,
        });
      });

      consume(data);
    });

    it("should decode the Yosensi YO Relay Switch (outputModeCH2,outputModeAllCH) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "02a600006400100100640011ff0004",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_mode_ch2");
        assert.equal(value.data.outputModeCH2, 0);

        validateSchema(value.data, outputModeCH2Schema, {
          throwError: true,
        });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "output_mode_all_ch");
        assert.equal(value.data.outputModeAllCH, 4);

        validateSchema(value.data, outputModeAllCHSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
