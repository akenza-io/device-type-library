import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, expectSample } from "test-utils";

describe("Watecco BoB Uplink", () => {
  let reportSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let learningSchema = null;
  let statusSchema = null;
  let machineRuntime = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    reportSchema = loadSchema(`${import.meta.dirname}/report.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    learningSchema = loadSchema(`${import.meta.dirname}/learning.schema.json`);
    statusSchema = loadSchema(`${import.meta.dirname}/status.schema.json`);
    machineRuntime = loadSchema(`${import.meta.dirname}/machine_runtime.schema.json`);
  });


  describe("consume()", () => {
    it("should decode the Watecco BoB learning uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "6c00001f3f013601407f5b4467393c303176301c332b61345b7e303e2318373f333f2231444a4245",
        },
      };

      expectSample("learning", learningSchema, (data) => {
        assert.equal(data.fft1, 0.013124353692099727);
        assert.equal(data.fft2, 0.026043639357760395);
        assert.equal(data.fft3, 0.0186611904059543);
        assert.equal(data.fft4, 0.013944625797855959);
        assert.equal(data.fft5, 0.021122006723222998);
        assert.equal(data.fft6, 0.011688877507026319);
        assert.equal(data.fft7, 0.012304081586343494);
        assert.equal(data.fft8, 0.009843265269074794);
        assert.equal(data.fft9, 0.010048333295513854);
        assert.equal(data.fft10, 0.02419802711980887);

        assert.equal(data.fft11, 0.009843265269074794);
        assert.equal(data.fft12, 0.005741904740293631);
        assert.equal(data.fft13, 0.01045846934839197);
        assert.equal(data.fft14, 0.008817925136879503);
        assert.equal(data.fft15, 0.019891598564588647);
        assert.equal(data.fft16, 0.010663537374831026);
        assert.equal(data.fft17, 0.0186611904059543);
        assert.equal(data.fft18, 0.025838571331321336);
        assert.equal(data.fft19, 0.009843265269074794);
        assert.equal(data.fft20, 0.01271421763922161);

        assert.equal(data.fft21, 0.007177380925367038);
        assert.equal(data.fft22, 0.004921632634537397);
        assert.equal(data.fft23, 0.011278741454148202);
        assert.equal(data.fft24, 0.012919285665660668);
        assert.equal(data.fft25, 0.01045846934839197);
        assert.equal(data.fft26, 0.012919285665660668);
        assert.equal(data.fft27, 0.006972312898927979);
        assert.equal(data.fft28, 0.010048333295513854);
        assert.equal(data.fft29, 0.013944625797855959);
        assert.equal(data.fft30, 0.015175033956490308);

        assert.equal(data.fft31, 0.013534489744977844);
        assert.equal(data.fft32, 0.014149693824295017);

        assert.equal(data.learningFrom, "ZERO");
        assert.equal(data.learningPercentage, 0);
        assert.equal(data.peakFrequency, 6.25);
        assert.equal(data.peakFrequencyIndex, 2);
        assert.equal(data.temperature, 24);
        assert.equal(data.vibrationLevel, 0.026043639357760395);
      });

      consume(data);
    });

    it("should decode the Watecco BoB report uplink", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "52087f5a00353e090019260c552a0000007c77ffffffffffffffff",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 97.638);
      });

      expectSample("report", reportSchema, (data) => {
        assert.equal(data.anomalyLevel, 6.299);
        assert.equal(data.nrAlarms, 0);
        assert.equal(data.temperature, 23);
        assert.equal(data.operatingTime, 62);
        assert.equal(data.reportID, 9);
        assert.equal(data.maxAmplitude, 0.021);
        assert.equal(data.peakFrequencyIndex, 13);
        assert.equal(data.peakFrequency, 50.78125);
        assert.equal(data.goodVibration, 43.937);
        assert.equal(data.badVibrationPercentage1020, 12.089);
        assert.equal(data.badVibrationPercentage2040, 5.974);
        assert.equal(data.badVibrationPercentage4060, 0);
        assert.equal(data.badVibrationPercentage6080, 0);
        assert.equal(data.badVibrationPercentage80100, 0);
        assert.equal(data.anomalyLevelTo20Last24h, 119);
        assert.equal(data.anomalyLevelTo50Last24h, 255);
        assert.equal(data.anomalyLevelTo80Last24h, 255);
        assert.equal(data.anomalyLevelTo20Last30d, 255);
        assert.equal(data.anomalyLevelTo50Last30d, 255);
        assert.equal(data.anomalyLevelTo80Last30d, 255);
        assert.equal(data.anomalyLevelTo20Last6m, 255);
        assert.equal(data.anomalyLevelTo50Last6m, 255);
        assert.equal(data.anomalyLevelTo80Last6m, 255);
      });

      consume(data);
    });

    it("should decode the Watecco BoB sensor status uplink and set state", () => {
      const data = {
        data: {
          port: 1,
          payloadHex: "537E60",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastMachineStatus, "MACHINE_START");
        assert.exists(value.lastMachineStart);
        assert.equal(value.lastSensorStatus, "SENSOR_STOP");
        assert.exists(value.lastSensorStart);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 75.591);
        assert.equal(data.machineRunning, true);
        assert.equal(data.sensorRunning, false);
      });

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.machineStart, true);
        assert.equal(data.machineStop, false);
        assert.equal(data.sensorStart, false);
        assert.equal(data.sensorStop, false);
        assert.equal(data.sensorNoVibration, false);
        assert.equal(data.sensorStopNoVibration, false);
        assert.equal(data.sensorLearnKeepalive, false);
        assert.equal(data.machineStopWithErase, false);
        assert.equal(data.sensorState, "MACHINE_START");
      });

      consume(data);
    });

    it("should decode the Watecco BoB report uplink and repeat state", () => {
      const data = {
        state: {
          lastMachineStatus: "MACHINE_START",
          lastSensorStatus: "SENSOR_STOP",
          lastMachineStart: new Date().getTime() - 180 * 1000 * 60,
          lastSensorStart: new Date().getTime() - 180 * 1000 * 60
        },
        data: {
          port: 1,
          payloadHex: "52087f5a00353e090019260c552a0000007c77ffffffffffffffff",
        },
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 97.638);
        assert.equal(data.machineRunning, true);
        assert.equal(data.sensorRunning, false);
      });

      expectSample("report", reportSchema, (data) => {
        assert.equal(data.anomalyLevel, 6.299);
        assert.equal(data.nrAlarms, 0);
        assert.equal(data.temperature, 23);
        assert.equal(data.operatingTime, 62);
        assert.equal(data.reportID, 9);
        assert.equal(data.maxAmplitude, 0.021);
        assert.equal(data.peakFrequencyIndex, 13);
        assert.equal(data.peakFrequency, 50.78125);
        assert.equal(data.goodVibration, 43.937);
        assert.equal(data.badVibrationPercentage1020, 12.089);
        assert.equal(data.badVibrationPercentage2040, 5.974);
        assert.equal(data.badVibrationPercentage4060, 0);
        assert.equal(data.badVibrationPercentage6080, 0);
        assert.equal(data.badVibrationPercentage80100, 0);
        assert.equal(data.anomalyLevelTo20Last24h, 119);
        assert.equal(data.anomalyLevelTo50Last24h, 255);
        assert.equal(data.anomalyLevelTo80Last24h, 255);
        assert.equal(data.anomalyLevelTo20Last30d, 255);
        assert.equal(data.anomalyLevelTo50Last30d, 255);
        assert.equal(data.anomalyLevelTo80Last30d, 255);
        assert.equal(data.anomalyLevelTo20Last6m, 255);
        assert.equal(data.anomalyLevelTo50Last6m, 255);
        assert.equal(data.anomalyLevelTo80Last6m, 255);
      });

      consume(data);
    });

    it("should decode the Watecco BoB sensor status uplink and emit runtime", () => {
      const data = {
        state: {
          lastMachineStatus: "MACHINE_STOP",
          lastSensorStatus: "SENSOR_STOP",
          lastMachineStart: new Date().getTime() - 180 * 1000 * 60,
          lastSensorStart: new Date().getTime() - 180 * 1000 * 60
        },
        data: {
          port: 1,
          payloadHex: "537D60",
        },
      };

      expectSample("machine_runtime", machineRuntime, (data) => {
        if (process.env.TEST_MODE != "INTEGRATION") {
          assert.equal(data.machineRuntime, 180)
        }
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.equal(value.lastMachineStatus, "MACHINE_STOP");
        assert.exists(value.lastMachineStart);
        assert.equal(value.lastSensorStatus, "SENSOR_STOP");
        assert.exists(value.lastSensorStart);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryLevel, 75.591);
        assert.equal(data.machineRunning, false);
        assert.equal(data.sensorRunning, false);
      });

      expectSample("status", statusSchema, (data) => {
        assert.equal(data.machineStart, false);
        assert.equal(data.machineStop, true);
        assert.equal(data.sensorStart, false);
        assert.equal(data.sensorStop, false);
        assert.equal(data.sensorNoVibration, false);
        assert.equal(data.sensorStopNoVibration, false);
        assert.equal(data.sensorLearnKeepalive, false);
        assert.equal(data.machineStopWithErase, false);
        assert.equal(data.sensorState, "MACHINE_STOP");
      });

      consume(data);
    });
  });
});