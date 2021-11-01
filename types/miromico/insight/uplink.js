function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);

  // scale factors
  const tempPrecision = 0.01;
  const humidityPrecision = 0.5;
  // helper variables
  let sample;
  let accumulated;
  let topic;
  // settings
  let measInterval;
  let accumulatedMsgs;
  let led;
  let confirmedMsgs;
  let flags;
  // measurement values
  let temp;
  let humidity;
  let co2;
  let battery;

  // Script for RoomSensor with temp/hum
  // Sensor is transmitting 1 data struct
  // decoder has to be extended for additional co2-struct

  // 1. How many data structs are being transmitted?

  // 2. Get length of first struct

  // 3. Get message type:
  // 0x01 uplink temperature [0.01°C], humidity [0.5%]
  // 0x02 uplink co2 [ppm]
  // 0x03 uplink battery current consumption [uA]
  // 0x05 uplink device settings (temp, humidity)
  // 0x06 uplink device settings (co2)
  // 0x80 downlink
  const msgtype = Bits.bitsToUnsigned(bits.substr(8, 8));
  switch (msgtype) {
    case 1:
      // check for error sensor reading first
      topic = "measured";
      // up temp,hum
      accumulated = (Bits.bitsToUnsigned(bits.substr(0, 8)) - 1) / 3;
      // wrong decoding:
      // temp = Bits.bitsToSigned(bits.substr(24,8)) * 256  + Bits.bitsToSigned(bits.substr(16,8));
      // temp = temp * tempPrecision;
      // temp = Math.round(temp*100) / 100;
      // payload decoding incorrect: treat whole binary number as signed, not both bytes individually (örk...)
      temp = Bits.bitsToSigned(bits.substr(24, 8) + bits.substr(16, 8));
      temp *= tempPrecision;
      temp = Math.round(temp * 100) / 100.0;
      if (temp > 80.0) {
        topic = "error";
      }
      humidity = Bits.bitsToUnsigned(bits.substr(32, 8));
      humidity *= humidityPrecision;
      if (humidity > 100) {
        topic = "error";
      }
      // todo:
      // loop through datasets
      // meanwhile do it manually as we know the payload
      if (Bits.bitsToUnsigned(bits.substr(48, 8)) == 2) {
        // former: co2 = Bits.bitsToUnsigned(bits.substr(64,8)) * 256 + Bits.bitsToUnsigned(bits.substr(56,8));
        co2 = Bits.bitsToUnsigned(bits.substr(64, 8) + bits.substr(56, 8));
        if (co2 == 0) {
          topic = "error";
        }
      }
      break;
    case 2:
      // up co2
      topic = "measured";
      break;
    case 3:
      // up battery
      topic = "measured";
      break;
    case 5:
      // up device settings temp,hum
      measInterval =
        Bits.bitsToUnsigned(bits.substr(24, 8)) * 256 +
        Bits.bitsToUnsigned(bits.substr(16, 8));
      accumulatedMsgs = Bits.bitsToUnsigned(bits.substr(32, 8));
      confirmedMsgs = Bits.bitsToUnsigned(bits.substr(40, 1));
      led = Bits.bitsToUnsigned(bits.substr(41, 1));
      flags = bits.substr(40, 8);
      topic = "settings";
      break;
    case 6:
      // up device settings co2
      topic = "settings";
      break;
    default:
    // none of the above, set all values to zero
  }

  // 4. Calculate number of accumulated measurements

  const data = {
    message_type: msgtype,
    temperature: temp,
    humidity,
  };
  if (co2 != 0) {
    data.co2 = co2;
  }
  if (measInterval != 0) {
    data.measInterval = measInterval;
  }
  if (accumulatedMsgs != 0) {
    data.accumulatedMsgs = accumulatedMsgs;
  }
  if (topic == "settings") {
    data.flags = flags;
    data.led = led;
    data.confirmedMsgs = confirmedMsgs;
  }

  sample = { topic, data };
  emit("sample", sample);
}
