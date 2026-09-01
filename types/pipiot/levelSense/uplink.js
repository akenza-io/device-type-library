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

function ultrasonicDistance(bits, tiltedFlag, overTempFlag) {
  let us = Bits.bitsToUnsigned(bits);
  if (tiltedFlag || overTempFlag) {
    us = "ERROR";
  }
  return us;
}

function laserDistance(bits, tiltedFlag, overTempFlag) {
  let ld = Bits.bitsToUnsigned(bits);
  if (ld === 0 || ld > 200 || tiltedFlag || overTempFlag) {
    ld = "ERROR";
  }
  return ld;
}

function laserReflectance(bits) {
  const lr = Bits.bitsToUnsigned(bits) * 256;
  return lr;
}

function temperature(bits) {
  let tp = Bits.bitsToSigned(bits);
  if (tp < -40 || tp > 125) {
    tp = "ERROR";
  }
  return tp;
}

function tiltAngle(bits, overTempFlag) {
  let ta = Bits.bitsToUnsigned(bits);
  if (overTempFlag || ta >= 180) {
    ta = "ERROR";
  }

  return ta;
}

function batteryVoltage(bits) {
  let bv = Bits.bitsToUnsigned(bits);
  if (bv === 0 || bv > 200) {
    bv = "ERROR";
  } else {
    bv = bv * 0.025 + 3;
  }
  return bv;
}

function flags(bits) {
  const fl = {};
  fl.motionFlag = !!Number(bits.substring(0, 1));
  fl.dayTimerFlag = !!Number(bits.substring(1, 2));
  fl.overTempFlag = !!Number(bits.substring(2, 3));
  fl.tiltedFlag = !!Number(bits.substring(3, 4));
  fl.magSwitchFlag = !!Number(bits.substring(4, 5));
  fl.ultrasoundHWErrorFlag = !!Number(bits.substring(5, 6));
  fl.laserHWErrorFlag = !!Number(bits.substring(6, 7));
  fl.accelerometerHWErrorFlag = !!Number(bits.substring(7, 8));

  return fl;
}

function gnssFixTime(bits) {
  let gnssTime = Bits.bitsToUnsigned(bits);
  if (gnssTime === 0) {
    gnssTime = "TIMEOUT";
  } else if (gnssTime === 255) {
    gnssTime = "FAULT";
  }
  return gnssTime;
}

function gnssLatitude(bits) {
  const gnssLat = Bits.bitsToSigned(bits) * 0.000001;
  return gnssLat;
}

function gnssLongitude(bits) {
  const gnssLong = Bits.bitsToSigned(bits) * 0.000001;
  return gnssLong;
}

function gnssAltitude(bits) {
  const gnssAlt = Bits.bitsToUnsigned(bits) * 10;
  return gnssAlt;
}

function gnssHDOP(bits) {
  const hdop = Bits.bitsToUnsigned(bits) * 0.01;
  return hdop;
}

function ultrasonicDistanceExt(bits, ultrasoundHWErrorFlag) {
  let ude = Bits.bitsToUnsigned(bits);
  if (ude === 0 || ultrasoundHWErrorFlag) {
    ude = "ERROR";
  } else {
    ude = Math.round((ude *= 2 / 10));
  }
  return ude;
}

function laserDistanceExt(bits, laserHWErrorFlag) {
  let lde = Bits.bitsToUnsigned(bits);
  if (lde === 0 || laserHWErrorFlag) {
    lde = "ERROR";
  } else {
    lde = Math.round((lde *= 2 / 10));
  }
  return lde;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let topic = "default";
  const data = {};
  const lifecycle = {};

  // Reserved 1 bit
  const subType = Bits.bitsToUnsigned(bits.substring(1, 4));
  // Reserved 4 bits

  // Standart Meassurement
  if (subType === 0) {
    const distance = {};
    const fl = flags(bits.substring(8, 16));
    lifecycle.motionFlag = fl.motionFlag;
    lifecycle.dayTimerFlag = fl.dayTimerFlag;
    lifecycle.overTempFlag = fl.overTempFlag;
    lifecycle.tiltedFlag = fl.tiltedFlag;
    lifecycle.magSwitchFlag = fl.magSwitchFlag;
    lifecycle.ultrasoundHWErrorFlag = fl.ultrasoundHWErrorFlag;
    lifecycle.laserHWErrorFlag = fl.laserHWErrorFlag;
    lifecycle.accelerometerHWErrorFlag = fl.accelerometerHWErrorFlag;

    distance.ultrasonicDistance = ultrasonicDistance(
      bits.substring(16, 24),
      lifecycle.tiltedFlag,
      lifecycle.overTempFlag,
    );
    const fillLevel = getFillLevel(event.device, distance.ultrasonicDistance);
    if (fillLevel !== undefined) {
      distance.fillLevel = fillLevel;
    }
    distance.laserDistance = laserDistance(
      bits.substring(24, 32),
      lifecycle.tiltedFlag,
      lifecycle.overTempFlag,
    );
    emit("sample", { data: distance, topic: "distance" });

    data.laserReflectance = laserReflectance(bits.substring(32, 48));
    data.temperature = temperature(bits.substring(48, 56));
    data.tiltAngle = tiltAngle(bits.substring(56, 64), lifecycle.overTempFlag);
    lifecycle.batteryVoltage = batteryVoltage(bits.substring(64, 72));

    // GPS Fix
  } else if (subType === 1) {
    data.gnssFixTime = gnssFixTime(bits.substring(8, 16));
    if (data.gnssFixTime !== "TIMEOUT" || data.gnssFixTime !== "FAULT") {
      data.gnssLatitude = gnssLatitude(bits.substring(16, 48));
      data.gnssLongitude = gnssLongitude(bits.substring(48, 80));
      data.gnssAltitude = gnssAltitude(bits.substring(80, 88));
      data.gnssHDOP = gnssHDOP(bits.substring(88, 96));
    }
    topic = "gnss";
    // RSSI Test
  } else if (subType === 2) {
    data.testFrames = bits.substring(8, 16);
    topic = "rssi_test";
  } else if (subType === 3) {
    const ext = {};
    const fl = flags(bits.substring(8, 16));
    lifecycle.motionFlag = fl.motionFlag;
    lifecycle.dayTimerFlag = fl.dayTimerFlag;
    lifecycle.overTempFlag = fl.overTempFlag;
    lifecycle.tiltedFlag = fl.tiltedFlag;
    lifecycle.magSwitchFlag = fl.magSwitchFlag;
    lifecycle.ultrasoundHWErrorFlag = fl.ultrasoundHWErrorFlag;
    lifecycle.laserHWErrorFlag = fl.laserHWErrorFlag;
    lifecycle.accelerometerHWErrorFlag = fl.accelerometerHWErrorFlag;

    // Reserved 8
    ext.ultrasonicDistanceExt = ultrasonicDistanceExt(
      bits.substring(24, 40),
      lifecycle.ultrasoundHWErrorFlag,
    );
    ext.laserDistanceExt = laserDistanceExt(
      bits.substring(40, 48),
      lifecycle.laserHWErrorFlag,
    );
    emit("sample", { data: ext, topic: "ext" });

    data.laserReflectance = laserReflectance(bits.substring(48, 64));
    data.temperature = temperature(bits.substring(64, 72));
    data.tiltAngle = tiltAngle(bits.substring(72, 80), lifecycle.overTempFlag);
    lifecycle.batteryVoltage = batteryVoltage(bits.substring(80, 88));
    // Reserved 8
  }

  emit("sample", { data, topic });
}
