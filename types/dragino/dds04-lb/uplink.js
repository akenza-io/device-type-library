/**
 * Copyright (c) akenza.io 2025
 *
 * @summary Payload Decoder for Dragino DDS04-LB
 * @author akenza.io - dta - @t1llo
 *
 * Created at : 2025-12-08
 */

/**
 * Decodes the frequency band code into a string.
 * @param {number} code
 * @returns {string}
 */
function getFrequencyBand(code) {
  switch (code) {
    case 0x01:
      return "EU868";
    case 0x02:
      return "US915";
    case 0x03:
      return "IN865";
    case 0x04:
      return "AU915";
    case 0x05:
      return "KZ865";
    case 0x06:
      return "RU864";
    case 0x07:
      return "AS923";
    case 0x08:
      return "AS923-1";
    case 0x09:
      return "AS923-2";
    case 0x0A:
      return "AS923-3";
    case 0x0B:
      return "CN470";
    case 0x0C:
      return "EU433";
    case 0x0D:
      return "KR920";
    case 0x0E:
      return "MA869";
    case 0x0F:
      return "AS923-4";
    default:
      return "Unknown";
  }
}

/**
 * Entry point for the decoder.
 * @param {object} event
 */
function consume(event) {
  const payload = Hex.hexToBytes(event.data.payloadHex);
  const { port } = event.data;

  // FPort 2: Real-time Sensor Data
  if (port === 2) {
    const data = {};
    const lifecycle = {};

    // Byte 0-1: Battery & Interrupts
    const batAndFlags = (payload[0] << 8) | payload[1];
    const batMv = batAndFlags & 0x3FFF;
    lifecycle.batteryVoltage = batMv / 1000;

    // Bit 14: Interrupt Flag (0 = Normal, 1 = Interrupt)
    data.interruptFlag = ((batAndFlags >> 14) & 0x01) === 1;
    // Bit 15: Interrupt Level (0 = Low, 1 = High)
    data.interruptLevel = ((batAndFlags >> 15) & 0x01) === 1 ? "HIGH" : "LOW";

    // Distances (cm)
    data.distance1 = ((payload[2] << 8) | payload[3]) / 10;
    data.distance2 = ((payload[4] << 8) | payload[5]) / 10;
    data.distance3 = ((payload[6] << 8) | payload[7]) / 10;
    data.distance4 = ((payload[8] << 8) | payload[9]) / 10;

    // Byte 10: Message Type
    if (payload.length > 10) {
      if (payload[10] === 0x01) {
        data.messageType = "NORMAL_UPLINK";
      } else if (payload[10] === 0x02) {
        data.messageType = "REPLY_CONFIGURES_INFO";
      } else {
        data.messageType = "UNKNOWN";
      }
    }

    emit("sample", {
      data: data,
      topic: "default"
    });
    emit("sample", {
      data: lifecycle,
      topic: "lifecycle"
    });
  }

  // FPort 3: Historical Data (Datalog)
  // Payload contains multiples of 11 bytes
  else if (port === 3) {
    const entrySize = 11;
    for (let i = 0; i < payload.length; i += entrySize) {
      // Ensure we have enough bytes for a full entry
      if (i + entrySize > payload.length) break;

      const data = {};
      const header = payload[i];

      // Byte 0 bits decoding
      data.interruptFlag = (header & 0x01) === 1;
      data.interruptLevel = ((header >> 1) & 0x01) === 1 ? "HIGH" : "LOW";
      // Bit 6: Poll Message (not in schema, ignored)
      // Bit 7: PNACK (Packet Not Acknowledged)
      data.pnackMode = ((header >> 7) & 0x01) === 1;

      // Distances (only 3 supported in datalog)
      data.distance1 = ((payload[i + 1] << 8) | payload[i + 2]) / 10;
      data.distance2 = ((payload[i + 3] << 8) | payload[i + 4]) / 10;
      data.distance3 = ((payload[i + 5] << 8) | payload[i + 6]) / 10;
      // Distance 4 is not included in historical records

      // Timestamp (4 bytes, unsigned big-endian)
      const ts = (payload[i + 7] << 24) | (payload[i + 8] << 16) | (payload[i + 9] << 8) | payload[i + 10];
      // Convert unix seconds to Date object (ms)
      const timestamp = new Date(((ts >>> 0) * 1000));

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 86400000); // 1 day in ms

      if (timestamp < oneDayAgo || timestamp > now) {
        continue
      }

      emit("sample", {
        data: data,
        topic: "default",
        timestamp: timestamp
      });
    }
  }

  // FPort 5: Device Status / Configuration
  else if (port === 5) {
    const config = {};
    const lifecycle = {};

    if (payload[0] === 0x23) {
      config.sensorModel = "DDS04-LB";
    }

    // Firmware Version: 0x0100 -> 1.0.0
    // Formula: (Byte1 & 0x0F) . (Byte2 >> 4 & 0x0F) . (Byte2 & 0x0F)
    const major = payload[1] & 0x0F;
    const minor = (payload[2] >> 4) & 0x0F;
    const patch = payload[2] & 0x0F;
    config.firmwareVersion = `${major}.${minor}.${patch}`;

    config.frequencyBand = getFrequencyBand(payload[3]);

    if (payload[4] !== 0xFF) {
      config.subBand = payload[4].toString();
    }

    const batMv = (payload[5] << 8) | payload[6];
    lifecycle.batteryVoltage = batMv / 1000;

    emit("sample", {
      data: config,
      topic: "configuration"
    });
    emit("sample", {
      data: lifecycle,
      topic: "lifecycle"
    });
  }
}
