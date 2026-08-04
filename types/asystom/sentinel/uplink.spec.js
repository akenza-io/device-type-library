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

  let errorSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/error.schema.json`)
      .then((parsedSchema) => {
        errorSchema = parsedSchema;
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

        assert.equal(value.data.yAcceleration, 0.0063477531090257115);
        assert.equal(value.data.yAccelerationPeak, 0.023437857633325704);
        assert.equal(value.data.yKurtosis, 3.109788662546731);
        assert.equal(value.data.yVibrationRoot, 0);
        assert.equal(value.data.yVelocity, 0.08392462043183031);
        assert.equal(value.data.yVelocityF1, 0);
        assert.equal(value.data.yVelocityF2, 0);
        assert.equal(value.data.yVelocityF3, 0);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
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

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

      consume(data);
    });


    it("Asystom Sentinel initial segmented payload", () => {
      const data = {
        data: {
          port: 100,
          payloadHex:
            "7004008c080e92220265320b5daeaca05db7389f3e8ede8cb998e9915089348eeecf61c289a97a996e86de8b6b92e47f007c",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.segmentedFrame.currentPayload.length, 50);
        assert.equal(value.segmentedFrame.expectedLength, 112);
        assert.equal(value.segmentedFrame.nbOfElements, 4);
      });

      consume(data);
    });

    it("Asystom Sentinel seconed segmented payload", () => {
      const data = {
        state: {
          segmentedFrame: {
            currentPayload: [
              112,
              4,
              0,
              140,
              8,
              14,
              146,
              34,
              2,
              101,
              50,
              11,
              93,
              174,
              172,
              160,
              93,
              183,
              56,
              159,
              62,
              142,
              222,
              140,
              185,
              152,
              233,
              145,
              80,
              137,
              52,
              142,
              238,
              207,
              97,
              194,
              137,
              169,
              122,
              153,
              110,
              134,
              222,
              139,
              107,
              146,
              228,
              127,
              0,
              124,
            ],
            expectedLength: 112,
            nbOfElements: 4,
          }
        },
        data: {
          port: 101,
          payloadHex:
            "d872a802cb0cca07de05b70b35091a007000db01fa0b45054a06ad0be2071f00be0159027b0575063805b10bd4010f001701",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
        assert.equal(value.segmentedFrame.currentPayload.length, 100);
        assert.equal(value.segmentedFrame.expectedLength, 112);
        assert.equal(value.segmentedFrame.nbOfElements, 4);
      });

      consume(data);
    });

    it("Asystom Sentinel final segmented payload", () => {
      const data = {
        state: {
          segmentedFrame: {
            currentPayload: [112, 4, 0, 140, 8, 14, 146, 34, 2, 101, 50, 11, 93, 174, 172, 160, 93, 183, 56, 159, 62, 142, 222, 140, 185, 152, 233, 145, 80, 137, 52, 142, 238, 207, 97, 194, 137, 169, 122, 153, 110, 134, 222, 139, 107, 146, 228, 127, 0, 124, 216, 114, 168, 2, 203, 0, 202, 7, 222, 5, 183, 11, 53, 9, 26, 0, 112, 0, 219, 1, 250, 0, 69, 5, 74, 6, 173, 0, 226, 7, 31, 0, 190, 1, 89, 2, 123, 5, 117, 6, 56, 5, 177, 11, 212, 1, 0, 0, 23, 1],
            expectedLength: 112,
            nbOfElements: 4,
          }
        }
        ,
        data: {
          port: 102,
          payloadHex:
            "dd230000d708f69c00007845",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "environment");
        assert.equal(value.data.batteryVoltage, 3.338673990997177);
        assert.equal(value.data.humidity, 19.685664148928055);
        assert.equal(value.data.temperature, 33.821503776607926);

        validateSchema(value.data, environmentSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.kurtosisUltrasound, 0.034531166552224005);
        assert.equal(value.data.soundSonicRmslog, -58.02929732204166);
        assert.equal(value.data.temperatureMachineSurface, 45.30258487830935);

        assert.equal(value.data.vibrationFrequencyBandS0, -47.832455939574274);
        assert.equal(value.data.vibrationFrequencyBandS1, -55.85488670176241);
        assert.equal(value.data.vibrationFrequencyBandS2, -42.558937972075995);
        assert.equal(value.data.vibrationFrequencyBandS3, -56.70634012359808);
        assert.equal(value.data.vibrationFrequencyBandS4, -66.65369649805447);
        assert.equal(value.data.vibrationFrequencyBandS5, -67.45937285420004);
        assert.equal(value.data.vibrationFrequencyBandS6, -60.512703135729);
        assert.equal(value.data.vibrationFrequencyBandS7, -64.50446326390478);
        assert.equal(value.data.vibrationFrequencyBandS8, -69.54222934309911);
        assert.equal(value.data.vibrationFrequencyBandS9, -66.67658503089952);

        assert.equal(value.data.soundFrequencyBandS10, -28.164339665827427);
        assert.equal(value.data.soundFrequencyBandS11, -36.1043717097734);
        assert.equal(value.data.soundFrequencyBandS12, -50.661478599221795);
        assert.equal(value.data.soundFrequencyBandS13, -60.070954451819645);
        assert.equal(value.data.soundFrequencyBandS14, -71.2314030670634);
        assert.equal(value.data.soundFrequencyBandS15, -68.0453192950332);
        assert.equal(value.data.soundFrequencyBandS16, -64.2069123369192);
        assert.equal(value.data.soundFrequencyBandS17, -75.06294346532387);
        assert.equal(value.data.soundFrequencyBandS18, -77.34264133669032);
        assert.equal(value.data.soundFrequencyBandS19, -82.70771343556878);

        assert.equal(value.data.xAcceleration, 0.16601815823605706);
        assert.equal(value.data.xAccelerationPeak, 0.48682383459220263);
        assert.equal(value.data.xKurtosis, 2.2919050888838024);
        assert.equal(value.data.xVibrationRoot, 1372.8542000457771);
        assert.equal(value.data.xVelocity, 0.30975814450293737);
        assert.equal(value.data.xVelocityF1, 3.5965514610513467);
        assert.equal(value.data.xVelocityF2, 0.039673456931410694);
        assert.equal(value.data.xVelocityF3, 0.17090104524299993);

        assert.equal(value.data.zAcceleration, 0.1467307545586328);
        assert.equal(value.data.zAccelerationPeak, 0.40357061112382697);
        assert.equal(value.data.zKurtosis, 2.038605325398642);
        assert.equal(value.data.zVibrationRoot, 1370.1075761043717);
        assert.equal(value.data.zVelocity, 2.140840772106508);
        assert.equal(value.data.zVelocityF1, 0.7141222247653926);
        assert.equal(value.data.zVelocityF2, 0);
        assert.equal(value.data.zVelocityF3, 0.42572671091783015);

        assert.equal(value.data.yAcceleration, 0.11596856641489281);
        assert.equal(value.data.yAccelerationPeak, 0.32935072861829556);
        assert.equal(value.data.yKurtosis, 2.456702525368124);
        assert.equal(value.data.yVibrationRoot, 79.19432364385443);
        assert.equal(value.data.yVelocity, 0.3814755474174105);
        assert.equal(value.data.yVelocityF1, 3.079270618753338);
        assert.equal(value.data.yVelocityF2, 0.047302967879758906);
        assert.equal(value.data.yVelocityF3, 0.6805523765926604);

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

      consume(data);
    });

    it("Asystom Sentinel checking for correct error handling", () => {
      const data = {
        state: {
          segmentedFrame: {
            currentPayload: [112, 4, 0, 140, 8, 14, 146, 34, 2, 101, 50, 11, 93, 174, 172, 160, 93, 183, 56, 159, 62, 142, 222, 140, 185, 152, 233, 145, 80, 137, 52, 142, 238, 207, 97, 194, 137, 169, 122, 153, 110, 134, 222, 139, 107, 146, 228, 127, 0, 124, 216, 114, 168, 2, 203, 0, 202, 7, 222, 5, 183, 11, 53, 9, 26, 0, 112, 0, 219, 1, 250, 0, 69, 5, 74, 6, 173, 0, 226, 7, 31, 0, 190, 1, 89, 2, 123, 5, 117, 6, 56, 5, 177, 11, 212, 1, 0, 0, 23, 1, 1],
            expectedLength: 112,
            nbOfElements: 4,
          }
        }
        ,
        data: {
          port: 102,
          payloadHex:
            "dd230000d708f69c00007845",
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "error");
        assert.equal(value.data.errorMessage, "Segments got saved incorrectly");

        validateSchema(value.data, errorSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.isNotNull(value);
      });

      consume(data);
    });
  });
});