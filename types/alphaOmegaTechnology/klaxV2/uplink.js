function toFloat(hex) {
  const sign = hex >> 31 ? -1 : 1;
  const exponent = (hex >> 23) & 0xff;
  return (
    ((sign * ((hex & 0x7fffff) | 0x800000) * 1.0) / Math.pow(2, 23)) *
    Math.pow(2, exponent - 127)
  );
}

function filterPositionUnit(filterPositionUnit) {
  switch (filterPositionUnit) {
    case 0:
      return "NDEF";
    case 1:
      return "Wh";
    case 2:
      return "W";
    case 3:
      return "V";
    case 4:
      return "A";
    case 5:
      return "HZ";
    case 6:
      return "VARH";
    case 7:
      return "VAR";
    case 8:
      return "VAH";
    case 9:
      return "VA";
    default:
      return "UNDEFINED";
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bits = Bits.hexToBits(payload);
  const lifecycle = {};

  const devicetype = Bits.bitsToUnsigned(bits.substr(0, 2));
  if (devicetype === 0) {
    lifecycle.deviceType = "SML_KLAX";
  } else {
    lifecycle.deviceType = "MODBUS_KLAX";
  }
  lifecycle.payloadVersion = Bits.bitsToUnsigned(bits.substr(2, 6));

  lifecycle.connectionTest = !!Bits.bitsToUnsigned(bits.substr(8, 1));
  lifecycle.registersConfigured = !!Bits.bitsToUnsigned(bits.substr(9, 1));
  const readingMode = Bits.bitsToUnsigned(bits.substr(10, 3));
  switch (readingMode) {
    case 0:
      lifecycle.readingMode = "SML_MODE";
      break;
    case 1:
      lifecycle.readingMode = "IEC_NORMAL_MODE";
      break;
    case 2:
      lifecycle.readingMode = "IEC_BATTERY_MODE";
      break;
    case 3:
      lifecycle.readingMode = "LOGAREX_MODE";
      break;
    case 4:
      lifecycle.readingMode = "EBZ_MODE";
      break;
    case 5:
      lifecycle.readingMode = "TRITSCHLER_VC3_MODE";
      break;
    default:
      break;
  }
  lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(13, 3)) * 20;

  switch (port) {
    // APP
    case 3: {
      const messageIndex = Bits.bitsToUnsigned(bits.substr(16, 8));
      const messageNumber = Bits.bitsToUnsigned(bits.substr(24, 4));
      const totalMessages = Bits.bitsToUnsigned(bits.substr(28, 4));

      let pointer = 32;
      while (bits.length > pointer) {
        const payloadId = Bits.bitsToUnsigned(bits.substr(pointer, 8));
        pointer += 8;
        switch (payloadId) {
          // Register Filtering ID
          case 1: {
            const data = {};
            let topic = "register";
            data.filterPositionUnit = filterPositionUnit(
              Bits.bitsToUnsigned(bits.substr(pointer, 4)),
            );
            pointer += 5;
            // 1 bit reserved

            const filterPositionSelector = Bits.bitsToUnsigned(
              bits.substr(pointer, 2),
            );
            pointer += 2;
            switch (filterPositionSelector) {
              case 0:
                topic = "register_1";
                break;
              case 1:
                topic = "register_2";
                break;
              case 2:
                topic = "register_3";
                break;
              case 3:
                topic = "register_4";
                break;
              default:
                topic = "unknown";
                break;
            }

            data.filterPositionActive = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;

            // Reserved 4
            pointer += 4;

            data.dataPoint3Valid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            data.dataPoint2Valid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            data.dataPoint1Valid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            data.dataPointValid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;

            // Only give out data points which are valid
            if (data.dataPointValid) {
              data.dataPoint = toFloat(
                Bits.bitsToUnsigned(bits.substr(pointer, 32)),
              );
            }
            pointer += 32;
            if (data.dataPoint1Valid) {
              data.dataPoint1 = toFloat(
                Bits.bitsToUnsigned(bits.substr(pointer, 32)),
              );
            }
            pointer += 32;
            if (data.dataPoint2Valid) {
              data.dataPoint2 = toFloat(
                Bits.bitsToUnsigned(bits.substr(pointer, 32)),
              );
            }
            pointer += 32;
            if (data.dataPoint3Valid) {
              data.dataPoint3 = toFloat(
                Bits.bitsToUnsigned(bits.substr(pointer, 32)),
              );
            }
            pointer += 32;

            emit("sample", { data, topic });
            break;
          }
          // Register NOW
          case 2: {
            const register1 = {};
            const register2 = {};
            const register3 = {};
            const register4 = {};
            register1.registerfilterSet = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            register2.registerfilterSet = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            register3.registerfilterSet = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            register4.registerfilterSet = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;

            register1.registerfilterValid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            register2.registerfilterValid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            register3.registerfilterValid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;
            register4.registerfilterValid = !!Bits.bitsToUnsigned(
              bits.substr(pointer, 1),
            );
            pointer += 1;

            register1.filterPositionUnit = filterPositionUnit(
              Bits.bitsToUnsigned(bits.substr(pointer, 4)),
            );
            pointer += 4;

            register2.filterPositionUnit = filterPositionUnit(
              Bits.bitsToUnsigned(bits.substr(pointer, 4)),
            );
            pointer += 4;

            register3.filterPositionUnit = filterPositionUnit(
              Bits.bitsToUnsigned(bits.substr(pointer, 4)),
            );
            pointer += 4;

            register4.filterPositionUnit = filterPositionUnit(
              Bits.bitsToUnsigned(bits.substr(pointer, 4)),
            );
            pointer += 4;

            if (register1.registerfilterValid) {
              register1.dataPoint = Bits.bitsToUnsigned(
                bits.substr(pointer, 32),
              );
            }
            pointer += 32;
            if (register2.registerfilterValid) {
              register2.dataPoint = Bits.bitsToUnsigned(
                bits.substr(pointer, 32),
              );
            }
            pointer += 32;
            if (register3.registerfilterValid) {
              register3.dataPoint = Bits.bitsToUnsigned(
                bits.substr(pointer, 32),
              );
            }
            pointer += 32;
            if (register4.registerfilterValid) {
              register4.dataPoint = Bits.bitsToUnsigned(
                bits.substr(pointer, 32),
              );
            }
            pointer += 32;
            emit("sample", { data: register1, topic: "register_1" });
            emit("sample", { data: register2, topic: "register_2" });
            emit("sample", { data: register3, topic: "register_3" });
            emit("sample", { data: register4, topic: "register_4" });
            break;
          }
          case 3: {
            let serverID = "";
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;
            serverID += payload.substr(pointer / 4, 2);
            pointer += 8;

            lifecycle.serverID = serverID;
            break;
          }
          case 8:
            lifecycle.deviceID = Bits.bitsToUnsigned(bits.substr(pointer, 32));
            pointer += 32;
            break;

          default:
            break;
        }
      }
      break;
    }
    // CONFIG
    case 100:
      lifecycle.measurementInterval = Bits.bitsToUnsigned(bits.substr(16, 16));
      break;
    // INFO
    case 101:
      lifecycle.appVersion = `${Bits.bitsToUnsigned(
        bits.substr(16, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(24, 8))}`;
      break;
    // REG-SEARCH
    case 103: {
      const messageIndex = Bits.bitsToUnsigned(bits.substr(16, 8));
      const messageNumber = Bits.bitsToUnsigned(bits.substr(24, 4));
      const totalMessages = Bits.bitsToUnsigned(bits.substr(28, 4));
      const data = {};

      let pointer = 32;
      let i = 1;
      while (bits.length > pointer) {
        data[`register${i}ID`] = `${Bits.bitsToUnsigned(
          bits.substr(pointer, 8),
        )}.`;
        pointer += 8;
        data[`register${i}ID`] += `${Bits.bitsToUnsigned(
          bits.substr(pointer, 8),
        )}.`;
        pointer += 8;
        data[`register${i}ID`] += `${Bits.bitsToUnsigned(
          bits.substr(pointer, 8),
        )}`;
        pointer += 8;
        i++;
      }

      emit("sample", { data, topic: "register_search" });
      break;
    }
    // REG-SET
    case 104: {
      const data = {};
      data.registerfilter4Set = !!Bits.bitsToUnsigned(bits.substr(20, 1));
      data.registerfilter3Set = !!Bits.bitsToUnsigned(bits.substr(21, 1));
      data.registerfilter2Set = !!Bits.bitsToUnsigned(bits.substr(22, 1));
      data.registerfilter1Set = !!Bits.bitsToUnsigned(bits.substr(23, 1));

      data.registerFilter1ID = `${Bits.bitsToUnsigned(
        bits.substr(24, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(32, 8))}.${Bits.bitsToUnsigned(
        bits.substr(40, 8),
      )}`;

      data.registerFilter2ID = `${Bits.bitsToUnsigned(
        bits.substr(48, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(56, 8))}.${Bits.bitsToUnsigned(
        bits.substr(64, 8),
      )}`;

      data.registerFilter3ID = `${Bits.bitsToUnsigned(
        bits.substr(72, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(80, 8))}.${Bits.bitsToUnsigned(
        bits.substr(88, 8),
      )}`;

      data.registerFilter4ID = `${Bits.bitsToUnsigned(
        bits.substr(96, 8),
      )}.${Bits.bitsToUnsigned(bits.substr(104, 8))}.${Bits.bitsToUnsigned(
        bits.substr(112, 8),
      )}`;

      emit("sample", { data, topic: "register_set" });
      break;
    }
    default:
      break;
  }

  if (Object.keys(lifecycle).length !== 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
