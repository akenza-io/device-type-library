import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO Vibration uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let internalTemperatureSchema = null;
  let humiditySchema = null;
  let externalTemperatureSchema = null;
  let rmsAccelerationSchema = null;
  let peakAccelerationSchema = null;
  let crestFactorSchema = null;
  let standardDeviationSchema = null;
  let skewnessSchema = null;
  let kurtosisSchema = null;
  let rmsVelocitySchema = null;
  let displacementSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    internalTemperatureSchema = loadSchema(`${import.meta.dirname}/internal_temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    externalTemperatureSchema = loadSchema(`${import.meta.dirname}/external_temperature.schema.json`);
    rmsAccelerationSchema = loadSchema(`${import.meta.dirname}/rms_acceleration.schema.json`);
    peakAccelerationSchema = loadSchema(`${import.meta.dirname}/peak_acceleration.schema.json`);
    crestFactorSchema = loadSchema(`${import.meta.dirname}/crest_factor.schema.json`);
    standardDeviationSchema = loadSchema(`${import.meta.dirname}/standard_deviation.schema.json`);
    skewnessSchema = loadSchema(`${import.meta.dirname}/skewness.schema.json`);
    kurtosisSchema = loadSchema(`${import.meta.dirname}/kurtosis.schema.json`);
    rmsVelocitySchema = loadSchema(`${import.meta.dirname}/rms_velocity.schema.json`);
    displacementSchema = loadSchema(`${import.meta.dirname}/displacement.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO Vibration (battery voltage,internal temperature,relative humidity,external temperature,RMS Acceleration XYZ,Peak Acceleration XYZ) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "023f000008000110fd0d000100e7100000190d00114a00e34300150000040004000543001501000600050007",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 4349);
      });

      expectSample("internal_temperature", internalTemperatureSchema, (data) => {
        assert.equal(data.internalTemperature, 23.1);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 25);
      });

      expectSample("external_temperature", externalTemperatureSchema, (data) => {
        assert.equal(data.externalTemperature, 22.7);
      });

      expectSample("rms_acceleration", rmsAccelerationSchema, (data) => {
        assert.equal(data.rmsAccelerationX, 0.004);
        assert.equal(data.rmsAccelerationY, 0.004);
        assert.equal(data.rmsAccelerationZ, 0.005);
      });

      expectSample("peak_acceleration", peakAccelerationSchema, (data) => {
        assert.equal(data.peakAccelerationX, 0.006);
        assert.equal(data.peakAccelerationY, 0.005);
        assert.equal(data.peakAccelerationZ, 0.007);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Vibration (crest factor XYZ,standard deviation XYZ,skewness XYZ,kurtosis XYZ) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "029d0e11420015020161010f012e42001503001a001e003242001504fff900130002420015050004ffd4ffda",
        },
      };

      expectSample("crest_factor", crestFactorSchema, (data) => {
        assert.equal(data.crestFactorX, 3.53);
        assert.equal(data.crestFactorY, 2.71);
        assert.equal(data.crestFactorZ, 3.02);
      });

      expectSample("standard_deviation", standardDeviationSchema, (data) => {
        assert.equal(data.standardDeviationX, 0.26);
        assert.equal(data.standardDeviationY, 0.3);
        assert.equal(data.standardDeviationZ, 0.5);
      });

      expectSample("skewness", skewnessSchema, (data) => {
        assert.equal(data.skewnessX, -0.07);
        assert.equal(data.skewnessY, 0.19);
        assert.equal(data.skewnessZ, 0.02);
      });

      expectSample("kurtosis", kurtosisSchema, (data) => {
        assert.equal(data.kurtosisX, 0.04);
        assert.equal(data.kurtosisY, -0.44);
        assert.equal(data.kurtosisZ, -0.38);
      });

      consume(data);
    });

    it("should decode the Yosensi YO Vibration (rms velocity XYZ,displacement XYZ) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "0241003c4200150600090008000940001507000100010001",
        },
      };

      expectSample("rms_velocity", rmsVelocitySchema, (data) => {
        assert.equal(data.rmsVelocityX, 0.09);
        assert.equal(data.rmsVelocityY, 0.08);
        assert.equal(data.rmsVelocityZ, 0.09);
      });

      expectSample("displacement", displacementSchema, (data) => {
        assert.equal(data.displacementX, 1);
        assert.equal(data.displacementY, 1);
        assert.equal(data.displacementZ, 1);
      });

      consume(data);
    });
  });
});
