function intToHex(number) {
  let base = Number(number).toString(16);
  if (base.length % 2) {
    base = `0${base}`;
  }

  let hex = "";
  for (let i = 0; i < base.length; i += 2) {
    hex = base.slice(i, i + 2) + hex;
  }

  return hex;
}

function encodeDownlink(data) {
  const bytes = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(data)) {
    switch (key) {
      case "setKeepAlive": {
        bytes.push(0x02);
        bytes.push(data.setKeepAlive);
        break;
      }
      case "getKeepAliveTime": {
        bytes.push(0x12);
        break;
      }
      case "recalibrateMotor": {
        bytes.push(0x03);
        break;
      }
      case "getDeviceVersions": {
        bytes.push(0x04);
        break;
      }
      case "setOpenWindow": {
        const enabled = Number(data.setOpenWindow.enabled);
        const closeTime = parseInt(data.setOpenWindow.closeTime / 5);
        const delta = parseInt(data.setOpenWindow.delta, 8);
        const { motorPosition } = data.setOpenWindow;
        const motorPositionFirstPart = motorPosition & 0xff;
        const motorPositionSecondPart = (motorPosition >> 8) & 0xff;
        bytes.push(0x06);
        bytes.push(enabled);
        bytes.push(closeTime);
        bytes.push(motorPositionFirstPart);
        bytes.push((motorPositionSecondPart << 4) | delta);
        break;
      }

      case "getOpenWindowParams": {
        bytes.push(0x13);
        break;
      }
      case "setChildLock": {
        bytes.push(0x07);
        bytes.push(Number(data.setChildLock));
        break;
      }
      case "getChildLock": {
        bytes.push(0x14);
        break;
      }
      case "setTemperatureRange": {
        bytes.push(0x08);
        bytes.push(data.setTemperatureRange.min);
        bytes.push(data.setTemperatureRange.max);
        break;
      }
      case "getTemperatureRange": {
        bytes.push(0x15);
        break;
      }
      case "forceClose": {
        bytes.push(0x0b);
        break;
      }
      case "setInternalAlgoParams": {
        bytes.push(0x0c);
        bytes.push(data.setInternalAlgoParams.pFirstLast);
        bytes.push(data.setInternalAlgoParams.pNext);
        break;
      }
      case "getInternalAlgoParams": {
        bytes.push(0x16);
        break;
      }
      case "setInternalAlgoTdiffParams": {
        bytes.push(0x1a);
        bytes.push(data.setInternalAlgoTdiffParams.cold);
        bytes.push(data.setInternalAlgoTdiffParams.warm);
        break;
      }
      case "getInternalAlgoTdiffParams": {
        bytes.push(0x17);
        break;
      }
      case "setOperationalMode": {
        bytes.push(0x0d);
        bytes.push(data.setOperationalMode);
        break;
      }
      case "getOperationalMode": {
        bytes.push(0x18);
        break;
      }
      case "setTargetTemperature": {
        bytes.push(0x0e);
        bytes.push(data.setTargetTemperature);
        break;
      }
      case "setExternalTemperature": {
        bytes.push(0x0f);
        bytes.push(data.setExternalTemperature);
        break;
      }
      case "setJoinRetryPeriod": {
        // period should be passed in minutes
        let periodToPass = (data.setJoinRetryPeriod * 60) / 5;
        periodToPass = Number(periodToPass);
        bytes.push(0x10);
        bytes.push(periodToPass);
        break;
      }
      case "getJoinRetryPeriod": {
        bytes.push(0x19);
        break;
      }
      case "setUplinkType": {
        bytes.push(0x11);
        bytes.push(data.setUplinkType);
        break;
      }
      case "getUplinkType": {
        bytes.push(0x1b);
        break;
      }
      case "setTargetTemperatureAndMotorPosition": {
        bytes.push(0x31);
        bytes.push(
          data.setTargetTemperatureAndMotorPosition.motorPosition
        );
        bytes.push(
          data.setTargetTemperatureAndMotorPosition.targetTemperature
        );
        break;
      }
      case "setWatchDogParams": {
        bytes.push(0x1c);
        bytes.push(data.setWatchDogParams.confirmedUplinks);
        bytes.push(data.setWatchDogParams.unconfirmedUplinks);
        break;
      }
      case "getWatchDogParams": {
        bytes.push(0x1d);
        break;
      }
      case "setPrimaryOperationalMode": {
        bytes.push(0x1e);
        bytes.push(data.setPrimaryOperationalMode);
        break;
      }
      case "getPrimaryOperationalMode": {
        bytes.push(0x1f);
        break;
      }
      case "setProportionalAlgorithmParameters": {
        bytes.push(0x2a);
        bytes.push(data.setProportionalAlgorithmParameters.coefficient);
        bytes.push(data.setProportionalAlgorithmParameters.period);
        break;
      }
      case "getProportionalAlgorithmParameters": {
        bytes.push(0x29);
        break;
      }
      case "setTemperatureControlAlgorithm": {
        bytes.push(0x2c);
        bytes.push(data.setTemperatureControlAlgorithm);
        break;
      }
      case "getTemperatureControlAlgorithm": {
        bytes.push(0x2b);
        break;
      }
      case "setMotorPositionOnly": {
        const motorPosition = data.setMotorPositionOnly;
        const motorPositionFirstPart = motorPosition & 0xff;
        const motorPositionSecondPart = (motorPosition >> 8) & 0xff;
        bytes.push(0x2d);
        bytes.push(motorPositionSecondPart);
        bytes.push(motorPositionFirstPart);
        break;
      }
      case "deviceReset": {
        bytes.push(0x30);
        break;
      }
      case "setChildLockBehavior": {
        bytes.push(0x35);
        bytes.push(data.setChildLockBehavior);
        break;
      }
      case "getChildLockBehavior": {
        bytes.push(0x34);
        break;
      }
      case "setProportionalGain": {
        const kp = Math.round(data.setProportionalGain * 131072);
        const kpFirstPart = kp & 0xff;
        const kpSecondPart = (kp >> 8) & 0xff;
        const kpThirdPart = (kp >> 16) & 0xff;
        bytes.push(0x37);
        bytes.push(kpThirdPart);
        bytes.push(kpSecondPart);
        bytes.push(kpFirstPart);
        break;
      }
      case "getProportionalGain": {
        bytes.push(0x36);
        break;
      }
      case "setExternalTemperatureFloat": {
        const temp = data.setExternalTemperatureFloat * 10;
        const tempFirstPart = temp & 0xff;
        const tempSecondPart = (temp >> 8) & 0xff;
        bytes.push(0x3c);
        bytes.push(tempSecondPart);
        bytes.push(tempFirstPart);
        break;
      }
      case "setIntegralGain": {
        const ki = Math.round(data.setIntegralGain * 131072);

        const kiFirstPart = ki & 0xff;
        const kiSecondPart = (ki >> 8) & 0xff;
        const kiThirdPart = (ki >> 16) & 0xff;
        bytes.push(0x3e);
        bytes.push(kiThirdPart);
        bytes.push(kiSecondPart);
        bytes.push(kiFirstPart);
        break;
      }
      case "getIntegralGain": {
        bytes.push(0x3d);
        break;
      }
      case "setPiRunPeriod": {
        bytes.push(0x41);
        bytes.push(data.setPiRunPeriod);
        break;
      }
      case "getPiRunPeriod": {
        bytes.push(0x40);
        break;
      }
      case "setTempHysteresis": {
        const tempHysteresis = data.setTempHysteresis * 10;
        bytes.push(0x43);
        bytes.push(tempHysteresis);
        break;
      }
      case "getTempHysteresis": {
        bytes.push(0x42);
        break;
      }
      case "setOpenWindowPrecisely": {
        const enabledValue = data.setOpenWindowPrecisely.enabled ? 1 : 0;
        const duration = parseInt(data.setOpenWindowPrecisely.duration) / 5;
        const delta = data.setOpenWindowPrecisely.delta * 10

        bytes.push(0x45);
        bytes.push(enabledValue);
        bytes.push(duration);
        bytes.push(delta);
        break;
      }
      case "getOpenWindowPrecisely": {
        bytes.push(0x46);
        break;
      }
      case "setForceAttach": {
        bytes.push(0x47);
        bytes.push(data.setForceAttach);
        break;
      }
      case "getForceAttach": {
        bytes.push(0x48);
        break;
      }
      case "sendCustomHexCommand": {
        const { sendCustomHexCommand } = data;
        for (let i = 0; i < sendCustomHexCommand.length; i += 2) {
          const byte = parseInt(sendCustomHexCommand.substr(i, 2), 16);
          bytes.push(byte);
        }
        break;
      }
      default:
    }
  }

  return bytes;
}

function checkExpectedValues(value, defaultValue) {
  if (value !== undefined && value !== null) {
    return value;
  }
  return defaultValue;
}

function consume(event) {
  const port = checkExpectedValues(event.port, 1);
  const confirmed = checkExpectedValues(event.confirmed, true);
  let payloadHex = checkExpectedValues(event.payloadHex, "");

  if (payloadHex.length > 1) {
    emit("downlink", { payloadHex, port, confirmed });
  } else if (event.payload !== undefined) {
    const payloadNumber = encodeDownlink(event.payload);

    payloadNumber.forEach(byte => {
      payloadHex += intToHex(byte);
    });

    emit("downlink", {
      payloadHex,
      port,
      confirmed: true,
    });
  }
}
