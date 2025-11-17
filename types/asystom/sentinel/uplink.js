/*
 #              ######               #                                                   ######                                               #####                                    #    ######  ###
 #        ####  #     #   ##        # #   #      #      #   ##   #    #  ####  ######    #     #   ##   #   # #       ####    ##   #####     #     #  ####  #####  ######  ####       # #   #     #  #
 #       #    # #     #  #  #      #   #  #      #      #  #  #  ##   # #    # #         #     #  #  #   # #  #      #    #  #  #  #    #    #       #    # #    # #      #    #     #   #  #     #  #
 #       #    # ######  #    #    #     # #      #      # #    # # #  # #      #####     ######  #    #   #   #      #    # #    # #    #    #       #    # #    # #####  #         #     # ######   #
 #       #    # #   #   ######    ####### #      #      # ###### #  # # #      #         #       ######   #   #      #    # ###### #    #    #       #    # #    # #      #         ####### #        #
 #       #    # #    #  #    #    #     # #      #      # #    # #   ## #    # #         #       #    #   #   #      #    # #    # #    #    #     # #    # #    # #      #    #    #     # #        #
 #######  ####  #     # #    #    #     # ###### ###### # #    # #    #  ####  ######    #       #    #   #   ######  ####  #    # #####      #####   ####  #####  ######  ####     #     # #       ###

 https://resources.lora-alliance.org/document/ts013-1-0-0-payload-codec-api
*/

/**
 * @typedef {Object} DecodedUplink
 * @property {Object} data - The open JavaScript object representing the decoded uplink payload when no errors occurred
 * @property {string[]} errors - A list of error messages while decoding the uplink payload
 * @property {string[]} warnings - A list of warning messages that do not prevent the driver from decoding the uplink payload
 */
// Size of a physical value for a scalar measurement
const SCALAR_VALUE_SIZE = 3;

// Size of a physical value for a vector element
const VECTOR_ELEMENT_VALUE_SIZE = 2;

const DB = "dB";
const MmPerSecond = "mm/s";
const G = "g";
const RPM = "rpm";

// Scalar value identifiers
const BATTERY_LEVEL_IDENTIFIER = 0x00;
const CURRENT_LOOP_IDENTIFIER = 0x01;
const TEMPERATURE_IDENTIFIER = 0x0e;
const HUMIDITY_IDENTIFIER = 0x02;

// Vector type identifiers
const SHOCK_DETECTION_VECTOR = 0x0a;
const SIGNATURE_VECTOR = 0x0b;
const SIGNATURE_REFEFENCE = 0x0c;
const SIGNATURE_EXTENSIONS = 0x0d;
const SYSTEM_STATUS_REPORT = 0xff;

const VECTOR_TYPES = [
  SHOCK_DETECTION_VECTOR,
  SIGNATURE_VECTOR,
  SIGNATURE_REFEFENCE,
  SIGNATURE_EXTENSIONS,
  SYSTEM_STATUS_REPORT,
];

const SCHEDULING_PERIOD_SCALE_FACTOR = 10;
const SONIC_FREQUENCY_SCALE_FACTOR = 10;
const RPM_SCALE_FACTOR = 60;

// State variable
let inputData;
let decodeResult;
let globalFrame;
let globalView;
let elementCount;
let _segmentedFrame;

// Determine host endianness
const littleEndian = (() => {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
  // Int16Array uses the platform's endianness.
  return new Int16Array(buffer)[0] === 256;
})();

// Convert a byte array into a hex string
function toHexString(byteArray) {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

// A class to represent the physical values extracted from Sentinel data frames
const signaturePhysicalValues = [
  {
    name: "vibrationFrequencyBandS0",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS1",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS2",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS3",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS4",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS5",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS6",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS7",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS8",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "vibrationFrequencyBandS9",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS10",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS11",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS12",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS13",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS14",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS15",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS16",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS17",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS18",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  {
    name: "soundFrequencyBandS19",
    unit: DB,
    value: 0.0,
    min: -150.0,
    max: 0.0,
  },
  { name: "xAcceleration", unit: G, value: 0.0, min: 0.0, max: 16.0 },
  { name: "xVelocity", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "xAccelerationPeak", unit: G, value: 0.0, min: 0.0, max: 16.0 },
  { name: "xKurtosis", unit: "", value: 0.0, min: 0.0, max: 100.0 },
  { name: "xVibrationRoot", unit: RPM, value: 0.0, min: 0.0, max: 30000.0 },
  { name: "xVelocityF1", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "xVelocityF2", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "xVelocityF3", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "yAcceleration", unit: G, value: 0.0, min: 0.0, max: 16.0 },
  { name: "yVelocity", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "yAccelerationPeak", unit: G, value: 0.0, min: 0.0, max: 16.0 },
  { name: "yKurtosis", unit: "", value: 0.0, min: 0.0, max: 100.0 },
  { name: "yVibrationRoot", unit: RPM, value: 0.0, min: 0.0, max: 30000.0 },
  { name: "yVelocityF1", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "yVelocityF2", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "yVelocityF3", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "zAcceleration", unit: G, value: 0.0, min: 0.0, max: 16.0 },
  { name: "zVelocity", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "zAccelerationPeak", unit: G, value: 0.0, min: 0.0, max: 16.0 },
  { name: "zKurtosis", unit: "", value: 0.0, min: 0.0, max: 100.0 },
  { name: "zVibrationRoot", unit: RPM, value: 0.0, min: 0.0, max: 30000.0 },
  { name: "zVelocityF1", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "zVelocityF2", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  { name: "zVelocityF3", unit: MmPerSecond, value: 0.0, min: 0.0, max: 100.0 },
  {
    name: "temperatureMachineSurface",
    unit: "°C",
    value: 0.0,
    min: -273.15,
    max: 2000.0,
  },
  { name: "", unit: "", value: 0.0, min: 0.0, max: 100.0 },
  { name: "kurtosisUltrasound", unit: "", value: 0.0, min: 0.0, max: 1.0 },
  { name: "soundSonicRmslog", unit: DB, value: 0.0, min: -150.0, max: 0.0 },
  { name: "", unit: "", value: 0.0, min: 0.0, max: 65535.0 },
];

const CRC_CCITT_TABLE = [
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108,
  0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
  0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b,
  0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
  0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee,
  0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
  0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d,
  0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5,
  0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
  0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4,
  0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
  0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13,
  0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
  0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e,
  0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1,
  0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
  0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0,
  0x0481, 0x7466, 0x6447, 0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
  0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657,
  0x7676, 0x4615, 0x5634, 0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
  0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882,
  0x28a3, 0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92, 0xfd2e,
  0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
  0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f, 0xff3e, 0xcf5d,
  0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
  0x2e93, 0x3eb2, 0x0ed1, 0x1ef0,
];

// A representation of a segmented frame
class SegmentedFrame {
  constructor(frameChunk) {
    this._currentPayload = frameChunk;
    this._expectedLength = frameChunk[0];
    this._nbOfElements = frameChunk[1];
  }

  getCurrentPayload() {
    return this._currentPayload;
  }

  addPayloadChunk(frameChunk) {
    if (frameChunk.length > 0) {
      const temporary = this._currentPayload;
      this._currentPayload = new Uint8Array(
        temporary.length + frameChunk.length
      );
      this._currentPayload.set(temporary);
      this._currentPayload.set(frameChunk, temporary.length);
    }
  }

  // Checks whether all segments of a frame have been received
  isComplete() {
    return this._currentPayload.byteLength === this._expectedLength;
  }

  getLength() {
    return this._currentPayload.length - 4;
  }

  getNbElements() {
    return this._nbOfElements;
  }

  // The useful part of a reconstructed frame start 2 bytes after the frame start
  // (as these bytes contain the whole size and the number of elements) and stops
  // 2 bytes before the frame end (these 2 last bytes contain the CRC)
  getUsefulPayload() {
    return this._currentPayload.slice(2, this._currentPayload.length - 2);
  }

  // Check that the reconstructed frame is valid, i.e. there was no transmission problem
  checkCrc() {
    let inputArray = this._currentPayload;
    let crc = 0xffff; // initial value for ccitt_false
    let u16mask = 0xffff;
    let u8mask = 0xff;

    for (let i = 0; i < inputArray.byteLength; i++) {
      let currentByte = inputArray[i] & u8mask;
      crc = (crc ^ (currentByte << 8)) & u16mask;
      let tableIndex = (crc >> 8) & u8mask;
      crc = (crc << 8) & u16mask;
      crc = (crc ^ CRC_CCITT_TABLE[tableIndex]) & u16mask;
    }

    return crc === 0;
  }
}

// A class to represent the Sentinel device health

const SentinelDeviceHealth = [
  "LORAWAN_OK",
  "LORAWAN_UNKOWN_UNSOLLICITED_RECEPTION",
  "LORAWAN_INVALID_DOUBLE_DATA_LENGTH",
  "LORAWAN_UNKNOWN_TRANSMISSION_ERROR",
  "LORAWAN_PENDING_TRANSMISSON",
  "LORAWAN_LINK_CHECK_FAILURE",
  "LORAWAN_CONSECUTIVE_UNSOLLICITED_MESSAGE_MISSED",
  "LORAWAN_INVALID_PARAMETER_RECEIVED",
  "LORAWAN_MODEM_WAKEUP_FAILED",
  "LORAWAN_DATA_RATE_TOO_LOW",
];

// Convert a byte array into an ArrayBuffer
// Used to get integer values from a byte array, taking into account endianess
function byteArrayToUint8Array(byteArray) {
  let uint8Array = new Uint8Array(byteArray.length);
  uint8Array.set(byteArray);
  return uint8Array;
}

// Prepare the decoding result regarding firmware status
function extractFirmwareStatus(
  lastBootCausesSoftware,
  lastBootCausesHardware1stByte,
  lastBootCausesHardware2ndByte
) {
  decodeResult.data.firmwareStatus = {
    lastBootCauses: [],
    softwareStatus: "",
  };

  // Register HW-related boot causes
  if ((lastBootCausesHardware2ndByte & 0x1) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push("LOW_LEAKAGE_WAKEUP");
  }

  if ((lastBootCausesHardware2ndByte & (0x1 << 1)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push(
      "LOW_VOLTAGE_RISE_DETECTED"
    );
  }

  if ((lastBootCausesHardware2ndByte & (0x1 << 2)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push("LOSS_OF_CLOCK_RESET");
  }

  if ((lastBootCausesHardware2ndByte & (0x1 << 3)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push("LOSS_OF_LOCK_RESET");
  }

  if ((lastBootCausesHardware2ndByte & (0x1 << 5)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push("WATCHDOG");
  }

  if ((lastBootCausesHardware2ndByte & (0x1 << 6)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push("EXTERNAL_RESET_PIN");
  }

  if ((lastBootCausesHardware2ndByte & (0x1 << 7)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push("POWER_ON_RESET");
  }

  if ((lastBootCausesHardware1stByte & 0x1) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push(
      "JTAG_GENERATED_RESET"
    );
  }

  if ((lastBootCausesHardware1stByte & (0x1 << 1)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push("CORE_LOCKUP");
  }

  if ((lastBootCausesHardware1stByte & (0x1 << 2)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push(
      "SOFTWARE_SYSRESETREQ_BIT"
    );
  }

  if ((lastBootCausesHardware1stByte & (0x1 << 3)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push(
      "MDM_AP_SYSTEM_RESET_REQUEST"
    );
  }

  if ((lastBootCausesHardware1stByte & (0x1 << 5)) != 0) {
    decodeResult.data.firmwareStatus.lastBootCauses.push(
      "STOP_MODE_ACKNOWLEDGE_ERROR_RESET"
    );
  }

  // Register device software-related boot causes
  let lastBootCauseSoftwareAsEnum;
  try {
    lastBootCauseSoftwareAsEnum = SentinelDeviceHealth[lastBootCausesSoftware];
    decodeResult.data.firmwareStatus.softwareStatus =
      lastBootCauseSoftwareAsEnum.toString();
  } catch (ex) {
    decodeResult.data.firmwareStatus.softwareStatus = ex.message;
  }
}

// Extract public settings
function extractSchedulingSettings(
  schedulingSettingsData,
  vectorView,
  indexInVector
) {
  decodeResult.data.schedulingSettings = {
    activationBitmask: toHexString(schedulingSettingsData.slice(0, 4)),
    ambientPeriodicity:
      vectorView.getInt16(indexInVector + 4, littleEndian) *
      SCHEDULING_PERIOD_SCALE_FACTOR,
    predictionPeriodicity:
      vectorView.getInt16(indexInVector + 6, littleEndian) *
      SCHEDULING_PERIOD_SCALE_FACTOR,
    introspectionPeriodicity:
      vectorView.getInt16(indexInVector + 8, littleEndian) *
      SCHEDULING_PERIOD_SCALE_FACTOR,
  };
}

// Store sensor-related information
function setSensorInformation(bitmask) {
  decodeResult.data.advancedSettings.sensorInformation = {
    enumeration: "",
  };

  let sensorEnumeration = bitmask[0]; // 32-bit status data is stored as little endian on firmware and copied as-is

  if ((sensorEnumeration & 0x3) === 0x3) {
    decodeResult.data.advancedSettings.sensorInformation.enumeration +=
      "ANY_ACCELEROMETER";
  }

  if ((sensorEnumeration & 0xc) === 0xc) {
    decodeResult.data.advancedSettings.sensorInformation.enumeration +=
      "ANY_MICROPHONE";
  }

  // Only supported sensors are accelerometer and microphone
  // If the bitfield contains nothing, then it's an error
  if ((sensorEnumeration & 0xf) === 0) {
    decodeResult.data.advancedSettings.sensorInformation.enumeration =
      "NO_SENSOR";
    decodeResult.warnings.push(
      "NO_SENSOR_INFORMATION"
    );
  }

  let sensorOrientation = bitmask[2];
  if (sensorOrientation === 0) {
    decodeResult.data.advancedSettings.sensorInformation.orientation =
      "NO_ORIENTATION";
  } else if (sensorOrientation === 1) {
    decodeResult.data.advancedSettings.sensorInformation.orientation =
      "X_PREFFERED";
  } else if (sensorOrientation === 2) {
    decodeResult.data.advancedSettings.sensorInformation.orientation =
      "Y_PREFFERED";
  } else if (sensorOrientation === 4) {
    decodeResult.data.advancedSettings.sensorInformation.orientation =
      "Z_PREFFERED";
  }
}

// Set Wake_On-Event information
// See firmware header file utils/datamodel.h
function setWoeInfos(woeBytes, vectorView, index) {
  let paramsAndFlagAndMode = vectorView.getInt16(index, littleEndian);
  let thresholdAndProfile = vectorView.getInt16(index + 2, littleEndian);

  decodeResult.data.advancedSettings.wakeOnEventInformation = {
    woeMode: paramsAndFlagAndMode & 0xf,
    woeFlag: (paramsAndFlagAndMode & 0x10) >> 4 === 1,
    woeParam: (paramsAndFlagAndMode & 0xffe0) >> 5,
    woeProfile: thresholdAndProfile & 0x3,
    woeThreshold: (thresholdAndProfile & 0xfffc) >> 2,
    woePretrigThreshold: vectorView.getInt16(index + 4, littleEndian),
    woePostrigThreshold: vectorView.getInt16(index + 6, littleEndian),
  };

  switch (decodeResult.data.advancedSettings.wakeOnEventInformation.woeMode) {
    case 0:
      decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString =
        "WoeInactive";
      break;
    case 1:
      decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString =
        "WoeMotionTrig";
      break;
    case 2:
      decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString =
        "WoeMotionTrigAuto";
      break;
    case 3:
      decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString =
        "WoeSchedulerTrig";
      break;
    case 4:
      decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString =
        "WoeAnalogTrig";
      break;
    case 5:
      decodeResult.data.advancedSettings.wakeOnEventInformation.woeModeString =
        "WoeContactTrig";
      break;
    default:
      decodeResult.warnings.push(
        `Unknown Wake-On-Event mode "${decodeResult.data.advancedSettings.wakeOnEventInformation.woeMode}"`
      );
      break;
  }
}

// Register LoRaWAN configuration in the frame
function setLorawanConfig(bytes, vectorView, arrayIndex, viewIndex) {
  decodeResult.data.advancedSettings.lorawanConfig = {};

  if ((bytes[arrayIndex] & 0x1) != 0) {
    decodeResult.data.advancedSettings.lorawanConfig.adrIsEnabled = true;
  } else {
    decodeResult.data.advancedSettings.lorawanConfig.adrIsEnabled = false;
  }

  if ((bytes[arrayIndex] & (0x1 << 1)) != 0) {
    decodeResult.data.advancedSettings.lorawanConfig.transmissionIsAcked = true;
  } else {
    decodeResult.data.advancedSettings.lorawanConfig.transmissionIsAcked = false;
  }

  if ((bytes[arrayIndex] & (0x1 << 2)) != 0) {
    decodeResult.data.advancedSettings.lorawanConfig.networkIsPrivate = true;
  } else {
    decodeResult.data.advancedSettings.lorawanConfig.networkIsPrivate = false;
  }

  if ((bytes[arrayIndex] & (0x1 << 3)) != 0) {
    decodeResult.data.advancedSettings.lorawanConfig.lorawanCodingRateIsBase = true;
  } else {
    decodeResult.data.advancedSettings.lorawanConfig.lorawanCodingRateIsBase = false;
  }

  if ((bytes[arrayIndex] & (0x1 << 4)) != 0) {
    decodeResult.data.advancedSettings.lorawanConfig.dwellTimeIsOn = true;
  } else {
    decodeResult.data.advancedSettings.lorawanConfig.dwellTimeIsOn = false;
  }

  if ((bytes[arrayIndex] & (0x1 << 5)) != 0) {
    decodeResult.data.advancedSettings.lorawanConfig.retransmitAckTwice = true;
  } else {
    decodeResult.data.advancedSettings.lorawanConfig.retransmitAckTwice = false;
  }

  if ((bytes[arrayIndex] & (0x1 << 6)) != 0) {
    decodeResult.data.advancedSettings.lorawanConfig.packetSplitIsEnabled = true;
  } else {
    decodeResult.data.advancedSettings.lorawanConfig.packetSplitIsEnabled = false;
  }

  decodeResult.data.advancedSettings.lorawanConfig.specialFrequencySettings =
    vectorView.getInt16(viewIndex + 2, littleEndian);
  decodeResult.data.advancedSettings.lorawanConfig.linkCheckPeriod =
    vectorView.getInt16(viewIndex + 4, littleEndian);
}

// Extract private settings
function extractAdvancedSettings(
  advancedSettingsData,
  vectorView,
  indexInVector
) {
  decodeResult.data.advancedSettings = {
    sensorInformationBitmask: toHexString(advancedSettingsData.slice(0, 4)),
  };

  setSensorInformation(advancedSettingsData);

  decodeResult.data.advancedSettings.frequencies = {
    sonicFrequencyHigh:
      vectorView.getInt16(indexInVector + 4, littleEndian) *
      SONIC_FREQUENCY_SCALE_FACTOR,
    sonicFrequencyLow:
      vectorView.getInt16(indexInVector + 6, littleEndian) *
      SONIC_FREQUENCY_SCALE_FACTOR,
    vibrationFrequencyHigh: vectorView.getInt16(
      indexInVector + 8,
      littleEndian
    ),
    vibrationFrequencyLow: vectorView.getInt16(
      indexInVector + 10,
      littleEndian
    ),
  };

  decodeResult.data.advancedSettings.rotationSpeedBoundaries = {
    rpmUpperBoundary:
      vectorView.getInt16(indexInVector + 12, littleEndian) * RPM_SCALE_FACTOR,
    rpmLowerBoundary:
      vectorView.getInt16(indexInVector + 14, littleEndian) * RPM_SCALE_FACTOR,
  };

  decodeResult.data.advancedSettings.mileageThreshold = vectorView.getInt16(
    indexInVector + 16,
    littleEndian
  );
  decodeResult.data.advancedSettings.referenceCustomParam = vectorView.getInt16(
    indexInVector + 18,
    littleEndian
  );
  decodeResult.data.advancedSettings.customSpectrumType = vectorView.getInt16(
    indexInVector + 20,
    littleEndian
  );
  decodeResult.data.advancedSettings.customSpectrumParam = vectorView.getInt16(
    indexInVector + 22,
    littleEndian
  );
  decodeResult.data.advancedSettings.woeBitmask = toHexString(
    advancedSettingsData.slice(24, 4)
  );

  setWoeInfos(advancedSettingsData, vectorView, indexInVector + 24);

  setLorawanConfig(advancedSettingsData, vectorView, 32, indexInVector + 32);
}

// Extract signature settings
function extractExtensionSettings(signatureSettings) {
  // Not implemented in this codec version
}

// Extract system status data
// The "vector" argument points to the start of the status data, i.e. the first byte following the vector type
// Thus it points to the byte representing the data indicator and is followed by the "last boot cause" 32-bit field
function extractSystemStatusData(vector, vectorView) {
  // Prepare result data structure
  decodeResult.data.advancedSettings = {};

  // Get last boot causes (software)
  let lastBootCausesSoftware = vectorView.getInt16(0, littleEndian);

  // Get last boot causes (hardware)
  let lastBootCausesHardware1stByte = vector[2];
  let lastBootCausesHardware2ndByte = vector[3];

  extractFirmwareStatus(
    lastBootCausesSoftware,
    lastBootCausesHardware1stByte,
    lastBootCausesHardware2ndByte
  );

  // Extract the version number
  let indexInVector = 4; // 4 bytes for the last boot causes
  let firmwareVersionAsBytes = vector.slice(indexInVector, indexInVector + 5); // The firmware version is represented by 5 bytes
  decodeResult.data.firmwareVersion = String.fromCharCode(
    ...firmwareVersionAsBytes
  );

  // Extract scheduling settings
  indexInVector += 5;
  extractSchedulingSettings(
    vector.slice(indexInVector, indexInVector + 10),
    vectorView,
    indexInVector
  );

  // Extract private settings
  indexInVector += 10;
  extractAdvancedSettings(
    vector.slice(indexInVector, indexInVector + 38),
    vectorView,
    indexInVector
  );

  // Extract signature settings
  indexInVector += 38;
  extractExtensionSettings(vector.slice(indexInVector));
}

// Process a vector in the data frame
// The "vector" argument points to the first byte following the "vectorType" argument, which represents the type of vector
function processVectorContent(vector, vectorType, nbElements, vectorView) {
  // Case where the vector type is unknown
  if (VECTOR_TYPES.includes(vectorType) === false) {
    decodeResult.errors.push(`Unknown vector type (${vectorType})`);
    return;
  }

  switch (vectorType) {
    case SHOCK_DETECTION_VECTOR:
      break;

    case SIGNATURE_VECTOR:
      decodeResult.data.signatureValues = extractSignatureValues(
        vectorView,
        nbElements
      );
      break;

    case SIGNATURE_REFEFENCE:
      break;

    case SIGNATURE_EXTENSIONS:
      decodeResult.warnings.push(`Extension frames are not yet supported`);
      break;

    case SYSTEM_STATUS_REPORT:
      extractSystemStatusData(vector, vectorView);
      break;

    default:
      // Should not occur (except if modified in another thread - ok, forget it !)
      break;
  }
}

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

// Extract physical values from a signature vector
// The input vector argument is a Buffer
function extractSignatureValues(vectorView, nbElements) {
  let signatureValues = [];

  for (
    let frameIndex = 0, measurementIndex = 0;
    frameIndex < nbElements * VECTOR_ELEMENT_VALUE_SIZE - 2;
    frameIndex += VECTOR_ELEMENT_VALUE_SIZE, ++measurementIndex
  ) {
    // Check whether architecture is little endian or not
    let valueInFrame = vectorView.getUint16(frameIndex, littleEndian);
    let scale = 65535;
    let physicalValue;

    // Skip values that are not useful anymore
    if (signaturePhysicalValues[measurementIndex].name === "") {
      continue;
    }

    physicalValue =
      (valueInFrame *
        (signaturePhysicalValues[measurementIndex].max -
          signaturePhysicalValues[measurementIndex].min)) /
      scale +
      signaturePhysicalValues[measurementIndex].min;

    let valueItem = signaturePhysicalValues[measurementIndex];
    valueItem.value = physicalValue;

    signatureValues.push(valueItem);
  }

  return signatureValues;
}

// This method extracts scalar values from the frame.
function extractScalarValues(nbScalars) {
  let scalarValues = [];
  let unit = "";
  let name = "";
  let valueInFrame;

  for (let i = 0; i < nbScalars * SCALAR_VALUE_SIZE; i += SCALAR_VALUE_SIZE) {
    valueInFrame = globalView.getUint16(i + 1, littleEndian);

    let min = 0.0,
      max = 100.0;
    let scale = 65535;
    let physicalValue;

    let valueToCompute = true;

    switch (inputData.bytes[i]) {
      case BATTERY_LEVEL_IDENTIFIER:
        name = "batteryVoltage";
        unit = "Volt";
        break;
      case CURRENT_LOOP_IDENTIFIER:
        name = "currentLoop";
        min = 0;
        max = 30;
        break;
      case HUMIDITY_IDENTIFIER:
        name = "humidity";
        unit = "% rH";
        break;
      case TEMPERATURE_IDENTIFIER:
        name = "temperature";
        unit = "°C";
        min = -273.15;
        max = 2000;
        break;
      default:
        decodeResult.warnings.push(
          `Unindentified scalar value indicator (${globalFrame[i]})`
        );
        valueToCompute = false;
        break;
    }

    if (valueToCompute) {
      physicalValue = (valueInFrame * (max - min)) / scale + min;
      let valueItem = { name, unit, physicalValue };
      scalarValues.push(valueItem);
    }
  }

  decodeResult.data.scalarValues = scalarValues;
}

/**
 * Decode uplink
 * @param {Object} input - An object provided by the IoT Flow framework
 * @param {number[]} input.bytes - Array of bytes represented as numbers as it has been sent from the device
 * @param {number} input.fPort - The Port Field on which the uplink has been sent
 * @returns {DecodedUplink} The decoded object
 */
function decodeUplink(input) {
  // Prepare function output
  decodeResult = {
    data: {},
    errors: [],
    warnings: [],
  };

  // Case where data seem corrupted
  if (input.fPort > 105) {
    decodeResult.errors.push(
      `Invalid number of elements in frame (${input.fPort})`
    );
    return decodeResult;
  }

  // Get first element id
  let elementId = input.bytes[0];

  // Manage system status report from old beacons as system status report from recent ones
  if (input.fPort === 67 && elementId === 0xff) {
    if (input.bytes.length === 84) {
      input.fPort = 1;
    } else {
      decodeResult.errors.push(
        "Inconsistent data from frame (looks partly as a system status report)"
      );
      return decodeResult;
    }
  }

  // Case of the first chunk of a segmented frame
  if (input.fPort === 100) {
    _segmentedFrame = new SegmentedFrame(input.bytes);
    decodeResult.warnings.push(
      "First frame of a segmented data frame; additional data frames are needed"
    );
    return decodeResult;
  }

  // Case of an intermediary or final segmented frame chunk
  if (input.fPort > 100 && input.fPort < 105) {
    if (_segmentedFrame === null) {
      decodeResult.warnings.push(
        "This is a following chunk of a segmented frame, but the first one has been lost"
      );
      return decodeResult;
    }

    _segmentedFrame.addPayloadChunk(input.bytes);

    // Not the final chunk --> current frame chunk fully processed
    if (!_segmentedFrame.isComplete()) {
      decodeResult.warnings.push(
        "Complementary frame of a segmented data frame; additional data frames are needed"
      );
      return decodeResult;
    }

    // Final chunk received --> prepare further processing
    if (_segmentedFrame.checkCrc()) {
      input.bytes = _segmentedFrame.getUsefulPayload();
      input.fPort = _segmentedFrame.getNbElements();
      _segmentedFrame = null;
    }

    // Case where there was a problem during transmission
    else {
      decodeResult.errors.push("Frame segmentation problem (CRC check failed)");
      return decodeResult;
    }
  }

  inputData = input;
  globalFrame = byteArrayToUint8Array(inputData.bytes);
  globalView = new DataView(globalFrame.buffer);
  elementCount = inputData.fPort;

  let nbScalars;
  let vectorInFrame = false;

  // Case where there is no vector
  if (inputData.bytes.length === elementCount * SCALAR_VALUE_SIZE) {
    // 2 characters are needed to represent a byte in hex format
    nbScalars = elementCount;
  }

  // Possible error case
  else {
    if (inputData.bytes.length < elementCount * SCALAR_VALUE_SIZE) {
      decodeResult.errors.push(
        `Inconsistent number of elements in frame (${elementCount}) and frame length (${inputData.bytes.length / 2
        })`
      );
      return decodeResult;
    }

    // There is a vector and possibly some scalars
    else {
      nbScalars = elementCount - 1;
      vectorInFrame = true;
    }
  }

  // Extract scalar values from frame
  if (nbScalars > 0) {
    extractScalarValues(nbScalars);
  }

  // Extract vector content
  if (vectorInFrame) {
    let vectorStart = nbScalars * SCALAR_VALUE_SIZE + 1;
    let vector = inputData.bytes.slice(vectorStart);
    let vectorType = inputData.bytes[nbScalars * SCALAR_VALUE_SIZE];
    let nbElements = vector.length / VECTOR_ELEMENT_VALUE_SIZE;
    let uint8Array = new Uint8Array(vector.length);
    uint8Array.set(vector);
    let vectorView = new DataView(uint8Array.buffer);

    processVectorContent(vector, vectorType, nbElements, vectorView);
  }

  return decodeResult;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const decoded = decodeUplink({
    fPort: port,
    bytes,
  }).data;

  for (const [key, value] of Object.entries(decoded)) {
    let data = {};
    let topic = "default";

    switch (key) {
      case "scalarValues": {
        // Map device values
        topic = "environment";
        value.forEach((sv) => {
          data[sv.name] = sv.physicalValue;
        });
        break;
      }
      case "signatureValues": {
        // Map default values
        value.forEach((sv) => {
          data[sv.name] = sv.value;
        });
        break;
      }
      case "firmwareVersion":
        topic = "firmware_version";
        // Catch none nested
        data.firmwareVersion = value;
        break;
      case "schedulingSettings":
        topic = "scheduling_settings";
        data = value;
        break;
      case "advancedSettings":
        topic = "advanced_settings";
        data = value;
        break;
      case "firmwareStatus":
        topic = "firmware_status";
        data = value;
        break;
      default:
        break;
    }

    emit("sample", { data: data, topic: topic });
  }
}