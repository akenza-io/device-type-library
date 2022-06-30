function isKthBitSet(byte, k) {
  return byte & (1 << k);
}

// TODO only send if needed
function decodeErrors(errorByte) {
  let error;
  if (isKthBitSet(errorByte, 0)) {
    error = "UNEXPECTED_ERROR_RESTARTING";
  } else if (isKthBitSet(errorByte, 1)) {
    error = "LORA_MODULE_FAIL_PLEASE_RESTART";
  } else if (isKthBitSet(errorByte, 2)) {
    error = "VOLTAGE_NOT_READ_PLEASE_RESTART";
  } else if (isKthBitSet(errorByte, 3)) {
    error = "DISTANCE_SENSOR_NO_RESPONSE_PLEASE_RESTART";
  } else {
    error = "ALL_CLEAR";
  }
  return error;
}

function hexToBytes(hex) {
  const bytes = [];
  let c = 0;
  while (c < hex.length) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
    c += 2;
  }
  return bytes;
}

function decodeLevelPercentage(level) {
  if (level === 255) {
    return "LEVEL_ERROR";
  }
  return level;
}

function decodeDistance(distance) {
  if (distance === 0) {
    return "TARGET_TOO_CLOSE";
  }

  if (distance === 65535) {
    return "TARGET_TOO_FAR";
  }
  if (distance === 1) {
    return "INVALID_READING";
  }
  return distance;
}

function consume(event) {
  const decoded = {};
  const bytes = hexToBytes(event.data.payloadHex);

  decoded.distance = decodeDistance((bytes[0] << 8) | bytes[1]);
  decoded.fillPercentage = decodeLevelPercentage(bytes[2]);
  decoded.voltage = (bytes[3] << 8) | bytes[4];
  const errorCode = decodeErrors(bytes[5]);

  if (errorCode !== "ALL_CLEAR") {
    decoded.errorCode = errorCode;
  }

  emit("sample", { data: decoded, topic: "default" });
}
