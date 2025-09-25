function cToF(celsius) {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);

  for (let pointer = 0; pointer !== payload.length;) {
    let topic = "default";
    const data = {};
    data.channel = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;
    const flag = Bits.bitsToUnsigned(bits.substr(pointer, 8));
    pointer += 8;

    switch (flag) {
      case 0x00:
        topic = "digital";
        data.digitalInput = Bits.bitsToUnsigned(bits.substr(pointer, 8));
        pointer += 8;
        break;
      case 0x01:
        topic = "digital";
        data.digitalOutput = Bits.bitsToUnsigned(bits.substr(pointer, 8));
        pointer += 8;
        break;
      case 0x02:
        topic = "analog";
        data.analogInput = Bits.bitsToUnsigned(bits.substr(pointer, 16)) / 100;
        pointer += 16;
        break;
      case 0x03:
        topic = "analog";
        data.analogOutput = Bits.bitsToUnsigned(bits.substr(pointer, 16)) / 100;
        pointer += 16;
        break;
      case 0x65:
        topic = "light";
        data.light = Bits.bitsToUnsigned(bits.substr(pointer, 16));
        pointer += 16;
        break;
      case 0x66:
        topic = "presence";
        data.presence = Bits.bitsToUnsigned(bits.substr(pointer, 8));
        pointer += 8;
        break;
      case 0x67:
        topic = "temperature";
        data.temperature = Bits.bitsToSigned(bits.substr(pointer, 16)) / 10;
        data.temperatureF = cToF(data.temperature);
        pointer += 16;
        break;
      case 0x68:
        topic = "humidity";
        data.humidity = Bits.bitsToUnsigned(bits.substr(pointer, 8)) / 2;
        pointer += 8;
        break;
      case 0x71:
        topic = "accelerometer";
        data.accX = Bits.bitsToSigned(bits.substr(pointer, 16)) / 1000;
        pointer += 16;
        data.accY = Bits.bitsToSigned(bits.substr(pointer, 16)) / 1000;
        pointer += 16;
        data.accZ = Bits.bitsToSigned(bits.substr(pointer, 16)) / 1000;
        pointer += 16;
        break;
      case 0x73:
        topic = "barometer";
        data.barometer = Bits.bitsToSigned(bits.substr(pointer, 16)) / 10;
        pointer += 16;
        break;
      case 0x86:
        topic = "gyrometer";
        data.gyroX = Bits.bitsToSigned(bits.substr(pointer, 16)) / 100;
        pointer += 16;
        data.gyroY = Bits.bitsToSigned(bits.substr(pointer, 16)) / 100;
        pointer += 16;
        data.gyroZ = Bits.bitsToSigned(bits.substr(pointer, 16)) / 100;
        pointer += 16;
        break;
      case 0x88:
        topic = "gps";
        data.latitude = Bits.bitsToSigned(bits.substr(pointer, 24)) / 10000;
        pointer += 24;
        data.longitude = Bits.bitsToSigned(bits.substr(pointer, 24)) / 10000;
        pointer += 24;
        data.altitude = Bits.bitsToSigned(bits.substr(pointer, 24)) / 100;
        pointer += 24;
        break;
      default:
        pointer = payload.length;
        break;
    }
    if (Object.keys(data).length > 1) {
      emit("sample", { data, topic });
    }
  }
}
