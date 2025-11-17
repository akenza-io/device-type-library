import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Asystom Sentinel Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
        done();
      });
  });

  let environmentSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/environment.schema.json`)
      .then((parsedSchema) => {
        environmentSchema = parsedSchema;
        done();
      });
  });

  let advancedSettingsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/advanced_settings.schema.json`)
      .then((parsedSchema) => {
        advancedSettingsSchema = parsedSchema;
        done();
      });
  });

  let firmwareStatusSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/firmware_status.schema.json`)
      .then((parsedSchema) => {
        firmwareStatusSchema = parsedSchema;
        done();
      });
  });

  let firmwareVersionSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/firmware_version.schema.json`)
      .then((parsedSchema) => {
        firmwareVersionSchema = parsedSchema;
        done();
      });
  });

  let schedulingSettingsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/scheduling_settings.schema.json`)
      .then((parsedSchema) => {
        schedulingSettingsSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("Asystom Sentinel default payload", () => {
      const data = {
        data: {
          port: 4,
          payloadHex:
            "0078080e1a2102ea130b827d087e5d7d827c9f7bcd78de775c7631748672eb81135dfb65fe616a5ed969566ef972d674d36f1c0037006a00c90700000000000000001a0037006000f607000000000000000017002e0057000b08000000000000000055210000a0071d7d0000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.batteryVoltage, 3.308155947203784);
        assert.equal(value.data.humidity, 7.779049362935836);
        assert.equal(value.data.temperature, 20.779550621805186);

        validateSchema(value.data, environmentSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.kurtosisUltrasound, 0.029785610742351417);
        assert.equal(value.data.soundSonicRmslog, -76.69031815060654);
        assert.equal(value.data.temperatureMachineSurface, 22.826027313649206);

        assert.equal(value.data.vibrationFrequencyBandS0, -76.4591439688716);
        assert.equal(value.data.vibrationFrequencyBandS1, -76.152437628748);
        assert.equal(value.data.vibrationFrequencyBandS2, -76.54383154039826);
        assert.equal(value.data.vibrationFrequencyBandS3, -77.04509040970474);
        assert.equal(value.data.vibrationFrequencyBandS4, -77.56466010528725);
        assert.equal(value.data.vibrationFrequencyBandS5, -79.21721217669948);
        assert.equal(value.data.vibrationFrequencyBandS6, -79.76424811169603);
        assert.equal(value.data.vibrationFrequencyBandS7, -80.64774547951477);
        assert.equal(value.data.vibrationFrequencyBandS8, -81.91805905241473);
        assert.equal(value.data.vibrationFrequencyBandS9, -82.89539940489814);

        assert.equal(value.data.soundFrequencyBandS10, -73.87502861066605);
        assert.equal(value.data.soundFrequencyBandS11, -95.46349279011216);
        assert.equal(value.data.soundFrequencyBandS12, -90.24490730144197);
        assert.equal(value.data.soundFrequencyBandS13, -92.58182650492103);
        assert.equal(value.data.soundFrequencyBandS14, -94.67841611352712);
        assert.equal(value.data.soundFrequencyBandS15, -87.97894254978256);
        assert.equal(value.data.soundFrequencyBandS16, -85.34905012588693);
        assert.equal(value.data.soundFrequencyBandS17, -82.63218127718014);
        assert.equal(value.data.soundFrequencyBandS18, -81.5403982604715);
        assert.equal(value.data.soundFrequencyBandS19, -84.47699702449073);

        assert.equal(value.data.xAcceleration, 0.006836041809719997);
        assert.equal(value.data.xAccelerationPeak, 0.025879301136797133);
        assert.equal(value.data.xKurtosis, 3.0411230640115967);
        assert.equal(value.data.xVibrationRoot, 0);
        assert.equal(value.data.xVelocity, 0.08392462043183031);
        assert.equal(value.data.xVelocityF1, 0);
        assert.equal(value.data.xVelocityF2, 0);
        assert.equal(value.data.xVelocityF3, 0);

        assert.equal(value.data.zAcceleration, 0.005615320057984283);
        assert.equal(value.data.zAccelerationPeak, 0.02124055848020142);
        assert.equal(value.data.zKurtosis, 3.141832608529793);
        assert.equal(value.data.zVibrationRoot, 0);
        assert.equal(value.data.zVelocity, 0.07019150072480354);
        assert.equal(value.data.zVelocityF1, 0);
        assert.equal(value.data.zVelocityF2, 0);
        assert.equal(value.data.zVelocityF3, 0);

        assert.equal(value.data.temperatureMachineSurface, 22.826027313649206);
        assert.equal(value.data.kurtosisUltrasound, 0.029785610742351417);
        assert.equal(value.data.soundSonicRmslog, -76.69031815060654);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });
      consume(data);
    });

    it("Asystom Sentinel startup payload", () => {
      const data = {
        data: {
          port: 1,
          payloadHex:
            "ff0000008276342e3537054114001e001e0068010c000000401f0000d00700001c001600050032000100c800b30091010000000069000000100e000001000300d0070000000000000200000001000000c8000000",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "advanced_settings");
        assert.equal(value.data.sensorInformationBitmask, "0c000000");
        assert.equal(value.data.sensorInformation.enumeration, "ANY_MICROPHONE");
        assert.equal(value.data.sensorInformation.orientation, "NO_ORIENTATION");

        assert.equal(value.data.frequencies.sonicFrequencyHigh, 80000);
        assert.equal(value.data.frequencies.sonicFrequencyLow, 0);
        assert.equal(value.data.frequencies.vibrationFrequencyHigh, 2000);
        assert.equal(value.data.frequencies.vibrationFrequencyLow, 0);

        assert.equal(value.data.rotationSpeedBoundaries.rpmUpperBoundary, 1680);
        assert.equal(value.data.rotationSpeedBoundaries.rpmLowerBoundary, 1320);

        assert.equal(value.data.mileageThreshold, 5);
        assert.equal(value.data.referenceCustomParam, 50);
        assert.equal(value.data.customSpectrumType, 1);
        assert.equal(value.data.customSpectrumParam, 200);
        assert.equal(value.data.woeBitmask, "");

        assert.equal(value.data.wakeOnEventInformation.woeMode, 3);
        assert.equal(value.data.wakeOnEventInformation.woeFlag, true);
        assert.equal(value.data.wakeOnEventInformation.woeParam, 5);
        assert.equal(value.data.wakeOnEventInformation.woeProfile, 1);
        assert.equal(value.data.wakeOnEventInformation.woeThreshold, 100);
        assert.equal(value.data.wakeOnEventInformation.woePretrigThreshold, 0);
        assert.equal(value.data.wakeOnEventInformation.woePostrigThreshold, 0);
        assert.equal(value.data.wakeOnEventInformation.woeModeString, "WoeSchedulerTrig");

        assert.equal(value.data.lorawanConfig.adrIsEnabled, true);
        assert.equal(value.data.lorawanConfig.transmissionIsAcked, false);
        assert.equal(value.data.lorawanConfig.networkIsPrivate, false);
        assert.equal(value.data.lorawanConfig.lorawanCodingRateIsBase, true);
        assert.equal(value.data.lorawanConfig.dwellTimeIsOn, false);
        assert.equal(value.data.lorawanConfig.retransmitAckTwice, true);
        assert.equal(value.data.lorawanConfig.packetSplitIsEnabled, true);
        assert.equal(value.data.lorawanConfig.specialFrequencySettings, 0);
        assert.equal(value.data.lorawanConfig.linkCheckPeriod, 3600);

        validateSchema(value.data, advancedSettingsSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "firmware_status");
        assert.deepEqual(value.data.lastBootCauses, [
          "LOW_VOLTAGE_RISE_DETECTED",
          "POWER_ON_RESET",
        ]);
        assert.equal(value.data.softwareStatus, "LORAWAN_OK");

        validateSchema(value.data, firmwareStatusSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "firmware_version");
        assert.deepEqual(value.data.firmwareVersion, "v4.57");

        validateSchema(value.data, firmwareVersionSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "scheduling_settings");
        assert.deepEqual(value.data.activationBitmask, "05411400");
        assert.deepEqual(value.data.ambientPeriodicity, 300);
        assert.deepEqual(value.data.introspectionPeriodicity, 3600);
        assert.deepEqual(value.data.predictionPeriodicity, 300);

        validateSchema(value.data, schedulingSettingsSchema, { throwError: true });
      });
      consume(data);
    });
  });
});
