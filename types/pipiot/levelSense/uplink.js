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
  fl.motionFlag = !!Number(bits.substr(0, 1));
  fl.dayTimerFlag = !!Number(bits.substr(1, 1));
  fl.overTempFlag = !!Number(bits.substr(2, 1));
  fl.tiltedFlag = !!Number(bits.substr(3, 1));
  fl.magSwitchFlag = !!Number(bits.substr(4, 1));
  fl.ultrasoundHWErrorFlag = !!Number(bits.substr(5, 1));
  fl.laserHWErrorFlag = !!Number(bits.substr(6, 1));
  fl.accelerometerHWErrorFlag = !!Number(bits.substr(7, 1));

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
  const subType = Bits.bitsToUnsigned(bits.substr(1, 3));
  // Reserved 4 bits

  // Standart Meassurement
  if (subType === 0) {
    const distance = {};
    const fl = flags(bits.substr(8, 8));
    lifecycle.motionFlag = fl.motionFlag;
    lifecycle.dayTimerFlag = fl.dayTimerFlag;
    lifecycle.overTempFlag = fl.overTempFlag;
    lifecycle.tiltedFlag = fl.tiltedFlag;
    lifecycle.magSwitchFlag = fl.magSwitchFlag;
    lifecycle.ultrasoundHWErrorFlag = fl.ultrasoundHWErrorFlag;
    lifecycle.laserHWErrorFlag = fl.laserHWErrorFlag;
    lifecycle.accelerometerHWErrorFlag = fl.accelerometerHWErrorFlag;

    distance.ultrasonicDistance = ultrasonicDistance(
      bits.substr(16, 8),
      lifecycle.tiltedFlag,
      lifecycle.overTempFlag,
    );
    distance.laserDistance = laserDistance(
      bits.substr(24, 8),
      lifecycle.tiltedFlag,
      lifecycle.overTempFlag,
    );
    emit("sample", { data: distance, topic: "distance" });

    data.laserReflectance = laserReflectance(bits.substr(32, 16));
    data.temperature = temperature(bits.substr(48, 8));
    data.tiltAngle = tiltAngle(bits.substr(56, 8), lifecycle.overTempFlag);
    lifecycle.batteryVoltage = batteryVoltage(bits.substr(64, 8));

    // GPS Fix
  } else if (subType === 1) {
    data.gnssFixTime = gnssFixTime(bits.substr(8, 8));
    if (data.gnssFixTime !== "TIMEOUT" || data.gnssFixTime !== "FAULT") {
      data.gnssLatitude = gnssLatitude(bits.substr(16, 32));
      data.gnssLongitude = gnssLongitude(bits.substr(48, 32));
      data.gnssAltitude = gnssAltitude(bits.substr(80, 8));
      data.gnssHDOP = gnssHDOP(bits.substr(88, 8));
    }
    topic = "gnss";
    // RSSI Test
  } else if (subType === 2) {
    data.testFrames = bits.substr(8, 8);
    topic = "rssi_test";
  } else if (subType === 3) {
    const ext = {};
    const fl = flags(bits.substr(8, 8));
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
      bits.substr(24, 16),
      lifecycle.ultrasoundHWErrorFlag,
    );
    ext.laserDistanceExt = laserDistanceExt(
      bits.substr(40, 8),
      lifecycle.laserHWErrorFlag,
    );
    emit("sample", { data: ext, topic: "ext" });

    data.laserReflectance = laserReflectance(bits.substr(48, 16));
    data.temperature = temperature(bits.substr(64, 8));
    data.tiltAngle = tiltAngle(bits.substr(72, 8), lifecycle.overTempFlag);
    lifecycle.batteryVoltage = batteryVoltage(bits.substr(80, 8));
    // Reserved 8
  }

  emit("sample", { data, topic });
}
