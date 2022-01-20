function stepSize(lo, hi, nbits, nresv) {
  return 1.0 / (((1 << nbits) - 1 - nresv) / (hi - lo));
}

function valueDecode(value, lo, hi, nbits, nresv) {
  return (value - nresv / 2) * stepSize(lo, hi, nbits, nresv) + lo;
}

function consume(event) {
  const payload = event.data.payloadHex; // 0500647ad001020200030202
  const bits = Bits.hexToBits(payload);
  let topic = "default";
  const data = {};
  const lifecycle = {};

  // Header
  const type = Bits.bitsToUnsigned(bits.substr(0, 8));
  lifecycle.demandMessage = Bits.bitsToUnsigned(bits.substr(15, 1));
  lifecycle.positionMessage = Bits.bitsToUnsigned(bits.substr(14, 1));
  lifecycle.hasMoved = Bits.bitsToUnsigned(bits.substr(13, 1));
  // Reserved
  lifecycle.sos = Bits.bitsToUnsigned(bits.substr(11, 1));
  const operatingMode = Bits.bitsToUnsigned(bits.substr(8, 3));

  switch (operatingMode) {
    case 0:
      lifecycle.operatingMode = "STANDBY";
      break;
    case 1:
      lifecycle.operatingMode = "MOTION_TRACKING";
      break;
    case 2:
      lifecycle.operatingMode = "PERMANENT_TRACKING";
      break;
    case 3:
      lifecycle.operatingMode = "MOTION_START_END_TRACKING";
      break;
    case 4:
      lifecycle.operatingMode = "ACTIVITY_TRACKING";
      break;
    case 5:
      lifecycle.operatingMode = "OFF";
      break;
    default:
      break;
  }

  const batteryLevel = Bits.bitsToUnsigned(bits.substr(16, 8));
  if (batteryLevel === 0) {
    lifecycle.batteryStatus = "CHARGING";
  } else if (batteryLevel === 255) {
    lifecycle.batteryStatus = "ERROR";
  } else {
    lifecycle.batteryLevel = batteryLevel;
  }
  lifecycle.temperature =
    valueDecode(Bits.bitsToUnsigned(bits.substr(24, 8)), -44, 85, 8, 0) * 0.5;

  switch (type) {
    // Frame pending
    case 0x00:
      break;
    // Position
    case 0x03:
      break;
    // Energy status
    case 0x04:
      break;
    // Heartbeat
    case 0x05: {
      topic = "heartbeat";
      const cause = Bits.bitsToUnsigned(bits.substr(32, 8));

      switch (cause) {
        case 0x00:
          data.resetCause = "NO_RESET";
          break;
        case 0x01:
          data.resetCause = "POWER_ON";
          break;
        case 0x02:
          data.resetCause = "UNREGULATED_DOMAIN";
          break;
        case 0x04:
          data.resetCause = "REGULATED_DOMAIN";
          break;
        case 0x08:
          data.resetCause = "EXTERNAL_PIN";
          break;
        case 0x10:
          data.resetCause = "WATCHDOG";
          break;
        case 0x20:
          data.resetCause = "LOCKUP";
          break;
        case 0x40:
          data.resetCause = "SYSTEM_REQUEST";
          break;
        default:
          break;
      }
      data.firmwareVersion = `${Bits.bitsToUnsigned(
        bits.substr(40, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(48, 8))}.${Bits.bitsToUnsigned(
        bits.substr(56, 8),
      )}`;
      data.bleFirmwareVersion = `${Bits.bitsToUnsigned(
        bits.substr(64, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(72, 8))}.${Bits.bitsToUnsigned(
        bits.substr(80, 8),
      )}`;

      break;
    }
    // Activity Status
    // Configuration
    // Shock detection
    case 0x07:
      break;
    // Shutdown
    case 0x09:
      break;

    // Event
    case 0x0a:
      break;

    // Collection scan
    case 0x0b:
      break;

    // Proximity
    case 0x0c:
      break;

    // Extended Position
    case 0x0e:
      break;

    // Debug
    case 0x0f:
      break;

    default:
      break;
  }

  // console.log(result);

  emit("sample", { data: lifecycle, topic: "lifecycle" });
  emit("sample", { data, topic });
}

consume({
  data: {
    port: 1,
    payloadHex: "0500647ad001020200030202",
  },
});
