function decoder(hexData) {
  const deviceData = {};
  try {
    const commandsReadingHelper = (deviceData, hexData, payloadLength) => {
      const resultToPass = {};
      let data = hexData.slice(0, -payloadLength);
      const commands = data.match(/.{1,2}/g);
      let commandLen = 0;
      commands.map((command, i) => {
        switch (command.toLowerCase()) {
          case "15":
            try {
              commandLen = 2;
              data = {
                temperatureRangeSettings: {
                  min: parseInt(commands[i + 1], 16),
                  max: parseInt(commands[i + 2], 16),
                },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;

          case "14":
            try {
              commandLen = 1;
              data = {
                childLock: !!parseInt(commands[i + 1], 16),
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;

          case "12":
            try {
              commandLen = 1;
              data = { keepAliveTime: parseInt(commands[i + 1], 16) };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "13":
            try {
              commandLen = 2;
              const enabled = !!parseInt(commands[i + 1], 16);
              const duration = parseInt(commands[i + 2], 16) * 5;
              const tmp = `0${commands[i + 4].toString(16)}`.substr(-2);
              const motorPos2 = `0${commands[i + 3].toString(16)}`.substr(-2);
              const motorPos1 = tmp[0];
              const motorPosition = parseInt(`0x${motorPos1}${motorPos2}`, 16);
              const delta = Number(tmp[1]);

              data = {
                openWindowParams: { enabled, duration, motorPosition, delta },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "18":
            try {
              commandLen = 1;
              data = { operationalMode: commands[i + 1].toString() };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "16":
            try {
              commandLen = 2;
              data = {
                internalAlgoParams: {
                  period: parseInt(commands[i + 1], 16),
                  pFirstLast: parseInt(commands[i + 2], 16),
                  pNext: parseInt(commands[i + 3], 16),
                },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "17":
            try {
              commandLen = 2;
              data = {
                internalAlgoTdiffParams: {
                  warm: parseInt(commands[i + 1], 16),
                  cold: parseInt(commands[i + 2], 16),
                },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "1b":
            try {
              commandLen = 1;
              data = { uplinkType: commands[i + 1] };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "19":
            try {
              commandLen = 1;
              const commandResponse = parseInt(commands[i + 1], 16);
              const periodInMinutes = (commandResponse * 5) / 60;
              data = { joinRetryPeriod: periodInMinutes };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "1d":
            try {
              commandLen = 2;
              // get default keepalive if it is not available in data
              const deviceKeepAlive = deviceData.keepAliveTime
                ? deviceData.keepAliveTime
                : 5;
              const wdpC =
                commands[i + 1] === "00"
                  ? false
                  : commands[i + 1] * deviceKeepAlive + 7;
              const wdpUc =
                commands[i + 2] === "00"
                  ? false
                  : parseInt(commands[i + 2], 16);
              data = { watchDogParams: { wdpC, wdpUc } };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }

            break;

          case "04":
            try {
              commandLen = 2;
              const hardwareVersion = commands[i + 1];
              const softwareVersion = commands[i + 2];
              data = {
                deviceVersions: {
                  hardware: Number(hardwareVersion),
                  software: Number(softwareVersion),
                },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;
          case "1f":
            try {
              commandLen = 4;
              const goodMedium = parseInt(
                `${commands[i + 1]}${commands[i + 2]}`,
                16,
              );
              const mediumBad = parseInt(
                `${commands[i + 3]}${commands[i + 4]}`,
                16,
              );

              data = {
                boundaryLevels: {
                  goodMedium: Number(goodMedium),
                  mediumBad: Number(mediumBad),
                },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;
          case "21":
            try {
              commandLen = 2;
              data = {
                autoZeroValue: parseInt(
                  `${commands[i + 1]}${commands[i + 2]}`,
                  16,
                ),
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;
          case "23":
            try {
              commandLen = 3;
              const goodZone = parseInt(commands[i + 1], 16);
              const mediumZone = parseInt(commands[i + 2], 16);
              const badZone = parseInt(commands[i + 3], 16);

              data = {
                notifyPeriod: {
                  goodZone: Number(goodZone),
                  mediumZone: Number(mediumZone),
                  badZone: Number(badZone),
                },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;
          case "25":
            try {
              commandLen = 3;
              const goodZone = parseInt(commands[i + 1], 16);
              const mediumZone = parseInt(commands[i + 2], 16);
              const badZone = parseInt(commands[i + 3], 16);

              data = {
                measurementPeriod: {
                  goodZone: Number(goodZone),
                  mediumZone: Number(mediumZone),
                  badZone: Number(badZone),
                },
              };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;
          case "27":
            try {
              commandLen = 9;
              const durationGoodBeeping = parseInt(commands[i + 1], 16);
              const durationGoodLoud = parseInt(commands[i + 2], 16) * 10;
              const durationGoodSilent = parseInt(commands[i + 3], 16) * 10;

              const durationMediumBeeping = parseInt(commands[i + 4], 16);
              const durationMediumLoud = parseInt(commands[i + 5], 16) * 10;
              const durationMediumSilent = parseInt(commands[i + 6], 16) * 10;

              const durationBadBeeping = parseInt(commands[i + 7], 16);
              const durationBadLoud = parseInt(commands[i + 8], 16) * 10;
              const durationBadSilent = parseInt(commands[i + 9], 16) * 10;

              data = {
                buzzerNotification: {
                  durationGoodBeeping: Number(durationGoodBeeping),
                  durationGoodLoud: Number(durationGoodLoud),
                  durationGoodSilent: Number(durationGoodSilent),
                  durationMediumBeeping: Number(durationMediumBeeping),
                  durationMediumLoud: Number(durationMediumLoud),
                  durationMediumSilent: Number(durationMediumSilent),
                  durationBadBeeping: Number(durationBadBeeping),
                  durationBadLoud: Number(durationBadLoud),
                  durationBadSilent: Number(durationBadSilent),
                },
              };

              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;
          case "29":
            try {
              commandLen = 15;
              const redGood = parseInt(commands[i + 1], 16);
              const greenGood = parseInt(commands[i + 2], 16);
              const blueGood = parseInt(commands[i + 3], 16);
              const durationGood =
                parseInt(`${commands[i + 4]}${commands[i + 5]}`, 16) * 10;

              const redMedium = parseInt(commands[i + 6], 16);
              const greenMedium = parseInt(commands[i + 7], 16);
              const blueMedium = parseInt(commands[i + 8], 16);
              const durationMedium =
                parseInt(`${commands[i + 9]}${commands[i + 10]}`, 16) * 10;

              const redBad = parseInt(commands[i + 11], 16);
              const greenBad = parseInt(commands[i + 12], 16);
              const blueBad = parseInt(commands[i + 13], 16);
              const durationBad =
                parseInt(`${commands[i + 14]}${commands[i + 15]}`, 16) * 10;

              data = {
                ledNotification: {
                  redGood: Number(redGood),
                  greenGood: Number(greenGood),
                  blueGood: Number(blueGood),
                  durationGood: Number(durationGood),
                  redMedium: Number(redMedium),
                  greenMedium: Number(greenMedium),
                  blueMedium: Number(blueMedium),
                  durationMedium: Number(durationMedium),
                  redBad: Number(redBad),
                  greenBad: Number(greenBad),
                  blueBad: Number(blueBad),
                  durationBad: Number(durationBad),
                },
              };

              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;
          case "2b":
            try {
              commandLen = 1;
              data = { autoZeroPeriod: parseInt(commands[i + 1], 16) };
              Object.assign(resultToPass, { ...resultToPass }, { ...data });
            } catch (e) {
              return {};
            }
            break;

          default:
            break;
        }
        commands.splice(i, commandLen);
      });

      return resultToPass;
    };
    const handleKeepAliveData = (hexData) => {
      const co2 = parseInt(hexData.substr(2, 4), 16);
      const temperature = (parseInt(hexData.substr(6, 4), 16) - 400) / 10;
      const humidity = Math.round(
        Number(((parseInt(hexData.substr(10, 2), 16) * 100) / 256).toFixed(2)),
      );
      const batteryVoltage = Number(
        ((parseInt(hexData.substr(12, 2), 16) * 8 + 1600) / 1000).toFixed(2),
      );

      const keepaliveData = {
        co2,
        temperature,
        humidity,
        batteryVoltage,
      };
      Object.assign(deviceData, { ...deviceData }, { ...keepaliveData });
    };

    if (hexData) {
      const byteArray = hexData
        .match(/.{1,2}/g)
        .map((byte) => parseInt(byte, 16));
      if (byteArray[0] === 1) {
        handleKeepAliveData(hexData);
      } else {
        // parse command answers
        const data = commandsReadingHelper(deviceData, hexData, 14);
        Object.assign(deviceData, { ...deviceData }, { ...data });

        // get only keepalive from device response
        const keepaliveData = hexData.slice(-14);
        handleKeepAliveData(keepaliveData);
      }

      return deviceData;
    }
  } catch (e) {
    return e;
  }
}

function consume(event) {
  const payload = event.data.payloadHex;
  const decoded = decoder(payload);

  emit("sample", { data: decoded, topic: "default" });
}
