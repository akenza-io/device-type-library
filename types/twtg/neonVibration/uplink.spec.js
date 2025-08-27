const chai = require("chai");

const rewire = require("rewire");
const utils = require("test-utils");

const { assert } = chai;

describe("TWTG Neon Vibration", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire("./uplink.js");
    consume = utils.init(script);
    utils
      .loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    utils
      .loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the TWTG Neon Vibration lifecycle payload", () => {
      const data = {
        data: {
          port: 14,
          payloadHex: "10c81dab653387bc",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.transmitterChargeUsed, 1038);
        assert.equal(value.data.sensorChargeUsed, 3506);
        assert.equal(value.data.averageTemperature, 19.515625);
        assert.equal(value.data.batteryLevel, 239);


        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration configuration", () => {
      const data = {
        data: {
          port: 11,
          payloadHex: "00aabbccdd0010",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.tag, "aabbccdd");
        assert.equal(value.data.type, "TRANSMITTER");
        assert.equal(value.data.status, "SUCCESS");

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration fragment start", () => {
      const data = {
        data: {
          port: 12,
          payloadHex: "0011200020075BCD15",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "fragment_start");
        assert.equal(value.data.port, 17);
        assert.equal(value.data.uplinkSize, 8192);
        assert.equal(value.data.fragmentSize, 32);
        assert.equal(value.data.crc, 123456789);

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration fragment", () => {
      const data = {
        data: {
          port: 12,
          payloadHex: "100001000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "fragment");
        assert.equal(value.data.index, 1);
        assert.deepEqual(value.data.decoded, [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31,
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31
        ]);

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration reboot", () => {
      const data = {
        data: {
          port: 16,
          payloadHex: "000001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "boot");
        assert.equal(value.data.rebootReason, "CONFIGURATION_UPDATE");

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration status", () => {
      const data = {
        data: {
          port: 16,
          payloadHex: "1000a80007fe",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "status");
        assert.equal(value.data.temperature, 0);
        assert.equal(value.data.rssi, -88);
        assert.equal(value.data.loraTxCounter, 7);
        assert.equal(value.data.powerSupply, true);
        assert.equal(value.data.configuration, true);
        assert.equal(value.data.sensorConnection, true);
        assert.equal(value.data.sensorPaired, true);
        assert.equal(value.data.flashMemory, true);
        assert.equal(value.data.internalTemperatureSensor, true);
        assert.equal(value.data.timeSynchronized, true);


        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration deactivation", () => {
      const data = {
        data: {
          port: 16,
          payloadHex: "3000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "deactivation");
        assert.equal(value.data.deactivationReason, "USER_TRIGGERED");

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration boot", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "000008",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "boot");
        assert.equal(value.data.rebootReason, "POWER_BROWN_OUT");

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration measurement", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "10eb343d0a2448b14d5680",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.axis, "X");
        assert.equal(value.data.temperature, -12);
        assert.equal(value.data.peakAcceleration, 0.035675048828125);
        assert.equal(value.data.rmwAcceleration, 0.01322174072265625);
        assert.equal(value.data.rmsVelocity, 0.33447265625);


        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration alert", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "2000000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "alert");
        assert.equal(value.data.sensorAlert0, false);
        assert.equal(value.data.sensorAlert1, false);
        assert.equal(value.data.sensorAlert2, false);
        assert.equal(value.data.sensorAlert3, false);
        assert.equal(value.data.sensorAlert4, false);
        assert.equal(value.data.sensorAlert5, false);
        assert.equal(value.data.sensorAlert6, false);
        assert.equal(value.data.sensorAlert7, false);

        assert.equal(value.data.spectrumAlert0, false);
        assert.equal(value.data.spectrumAlert1, false);
        assert.equal(value.data.spectrumAlert2, false);
        assert.equal(value.data.spectrumAlert3, false);
        assert.equal(value.data.spectrumAlert4, false);


        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration machine fault", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "30ead7002914b676100207010100000001",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "machine_fault");
        assert.equal(value.data.axis, "X");
        assert.equal(value.data.faultType, "COMMON_FAULT");
        assert.equal(value.data.faultCategory, "NONE");
        assert.deepEqual(value.data.harmonicFrequencies, [
          49.28125,
          98.5625,
          147.84375,
          197.125,
          246.40625,
          295.6875,
          344.96875,
          394.25,
          443.53125,
          492.8125
        ]);
        assert.deepEqual(value.data.harmonicAmplitudes, [
          0.40380859375,
          0.06334252450980392,
          0.00791781556372549,
          0.027712354473039217,
          0.003958907781862745,
          0.003958907781862745,
          0,
          0,
          0,
          0.003958907781862745
        ]);

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration statistics", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "40000000000000000000",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "statistics");
        assert.equal(value.data.selection, "X_RMS_VELOCITY");
        assert.equal(value.data.min, 0);
        assert.equal(value.data.max, 0);
        assert.equal(value.data.avg, 0);


        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });

    it("should decode the TWTG Neon Vibration spectrum", () => {
      const data = {
        data: {
          port: 17,
          payloadHex: "5064C800000193C00000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        },
      };

      utils.expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "spectrum");
        assert.equal(value.data.axis, "X");
        assert.equal(value.data.spectrumType, "ACCELERATION");
        assert.equal(value.data.temperature, 25);
        assert.equal(value.data.rmsVelocity, 0);
        assert.equal(value.data.rmsAcceleration, 0);
        assert.equal(value.data.peakAcceleration, 0);
        assert.equal(value.data.rpm, 0);

        assert.deepEqual(value.data.frequencies, [
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31
        ]);

        assert.deepEqual(value.data.magnitudes, [
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125,
          58183.125
        ]);

        // utils.validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      consume(data);
    });
  });
});
