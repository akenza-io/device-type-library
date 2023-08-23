function getFillLevel(device, distance) {
  if (device !== undefined && distance !== undefined) {
    if (device.customFields !== undefined) {
      const { customFields } = device;
      let scaleLength = null;
      let sensorDistance = 0;

      if (customFields.containerHeight !== undefined) {
        scaleLength = Number(device.customFields.containerHeight);
      }

      if (customFields.installationOffset !== undefined) {
        sensorDistance = Number(device.customFields.installationOffset);
      }

      if (scaleLength !== null) {
        const percentExact =
          (100 / scaleLength) * (scaleLength - (distance - sensorDistance));
        let fillLevel = Math.round(percentExact);
        if (fillLevel > 100) {
          fillLevel = 100;
        } else if (fillLevel < 0) {
          fillLevel = 0;
        }
        return fillLevel;
      }
    }
  }
  return undefined;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const { port } = event.data;
  const bytes = Hex.hexToBytes(payload);
  const data = {};
  const lifecycle = {};

  if (port === 1) {
    // TELEMETRY

    const variant = (bytes[0] << 8) | bytes[1];

    // decode header
    lifecycle.baseId = bytes[0] >> 4;
    lifecycle.majorVersion = bytes[0] & 0x0f;
    lifecycle.minorVersion = bytes[1] >> 4;
    lifecycle.productVersion = bytes[1] & 0x0f;
    lifecycle.upCnt = bytes[2];
    lifecycle.batteryVoltage = ((bytes[3] << 8) | bytes[4]) / 1000;
    let batteryLevel = Math.round((lifecycle.batteryVoltage - 4.4) / 0.016); // 6V - 4.4V

    if (batteryLevel > 100) {
      batteryLevel = 100;
    } else if (batteryLevel < 0) {
      batteryLevel = 0;
    }
    lifecycle.batteryLevel = batteryLevel;
    lifecycle.internalTemperature = Math.round(bytes[5] - 128);

    data.alarm = bytes[6] ? "ALARM" : "NO_ALARM";
    data.distance = (bytes[7] << 8) | bytes[8]; // in mm
    data.distanceCM = (bytes[7] << 8) | (bytes[8] / 10); // in cm
    const fillLevel = getFillLevel(event.device, data.distanceCM);
    if (fillLevel !== undefined) {
      data.fillLevel = fillLevel;
    }

    // decode product_version
    let byteCnt = 9;

    // ToF onboard
    if (bytes[1] & 0x01) {
      const tof = {};
      tof.tofStatus = bytes[byteCnt++];
      tof.tofDistance = (bytes[byteCnt++] << 8) | bytes[byteCnt++]; // in mm
      tof.tofIndex = bytes[byteCnt++];
      emit("sample", { data: tof, topic: "tof" });
    }

    // Radar onboard
    if (bytes[1] & 0x02) {
      const radar = {};
      radar.radarStatus = bytes[byteCnt++];
      radar.radarNoPeaks = bytes[byteCnt++];
      radar.radarDistance1 = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      radar.radarPeak1 = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      radar.radarDistance2 = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      radar.radarPeak2 = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      radar.radarDistance3 = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      radar.radarPeak3 = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      emit("sample", { data: radar, topic: "radar" });
    }

    // ACC onboard
    if (bytes[1] & 0x04) {
      const acc = {};
      acc.accStatus = bytes[byteCnt++] ? "ERROR" : "OK";
      acc.accOrientation = bytes[byteCnt++];
      acc.accOpen = bytes[byteCnt++];
      acc.accOpenCnt = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      acc.accImpact = bytes[byteCnt++] ? "IMPACT" : "NO_IMPACT";
      emit("sample", { data: acc, topic: "acc" });
    }

    // Hall onboard
    if (bytes[1] & 0x08) {
      const hall = {};
      hall.hallOpen = bytes[byteCnt++];
      hall.hallOpenCnt = (bytes[byteCnt++] << 8) | bytes[byteCnt++];
      emit("sample", { data: hall, topic: "hall" });
    }

    emit("sample", { data: lifecycle, topic: "lifecycle" });
    emit("sample", { data, topic: "default" });
  }
}
