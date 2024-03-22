function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const lifecycle = {};
  const fillLevel = {};
  const distance = {};
  const system = {};
  const events = {};
  const depth = {};
  const bitsLength = bits.length;

  const uplinkType = Bits.bitsToUnsigned(bits.substr(bitsLength - 2, 2));
  switch (uplinkType) {
    // Filllevel
    case 0: {
      const resetReason = Bits.bitsToUnsigned(bits.substr(0, 2));
      switch (resetReason) {
        case 0:
          lifecycle.resetReason = "ALL_OK";
          break;
        case 1:
          lifecycle.resetReason = "POWER_ON";
          break;
        case 2:
          lifecycle.resetReason = "WATCHDOG";
          break;
        case 3:
          lifecycle.resetReason = "SOFTWARE";
          break;
        default:
          break;
      }

      lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(2, 6)) * 2;
      if (lifecycle.batteryLevel === 126) {
        delete data.batteryLevel;
      }

      lifecycle.temperature = Bits.bitsToUnsigned(bits.substr(8, 7)) - 40;
      fillLevel.fillLevel = Bits.bitsToUnsigned(bits.substr(15, 7));
      if (fillLevel.fillLevel === 127) {
        delete fillLevel.fillLevel;
      }
      break;
    }
    // Distance
    case 1: {
      lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(0, 6)) * 2;
      if (lifecycle.batteryLevel === 126) {
        delete lifecycle.batteryLevel;
      }
      lifecycle.temperature = Bits.bitsToUnsigned(bits.substr(6, 7)) - 40;
      distance.distance = Bits.bitsToUnsigned(bits.substr(13, 9));
      if (distance.distance === 511) {
        delete distance.distance;
        distance.distanceError = "SENSOR_MODULE_NOT_RESPONDING";
      } else if (distance.distance === 510) {
        delete distance.distance;
        distance.distanceError = "LASER_SENSOR_INVALID_CONFIGURATIONS";
      }
      break;
    }
    // System
    case 2: {
      // Dev EUI 24
      // Reserved 6
      system.hardwareVersion = Bits.bitsToUnsigned(bits.substr(30, 6));
      system.softwareVersion = `${Bits.bitsToUnsigned(
        bits.substr(42, 2),
      )}.${Bits.bitsToUnsigned(bits.substr(36, 6))}.${Bits.bitsToUnsigned(
        bits.substr(44, 6),
      )}`;
      system.noOfDownlink = Bits.bitsToUnsigned(bits.substr(50, 2));
      system.downlinkFreq = Bits.bitsToUnsigned(bits.substr(52, 2));
      system.totalResetCount = Bits.bitsToUnsigned(bits.substr(54, 7));
      system.runTime = Bits.bitsToUnsigned(bits.substr(61, 12));
      // Reserved 1
      system.comTest = !!Bits.bitsToUnsigned(bits.substr(74, 1));
      // Reserved 1
      system.distanceTest = !!Bits.bitsToUnsigned(bits.substr(76, 1));
      system.tempTest = !!Bits.bitsToUnsigned(bits.substr(77, 1));
      // Reserved 3
      lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(81, 6)) * 2;
      if (lifecycle.batteryLevel === 126) {
        delete lifecycle.batteryLevel;
      }
      lifecycle.batteryVoltage =
        (Bits.bitsToUnsigned(bits.substr(87, 4)) * 100 + 2200) / 1000;
      const resetReason = Bits.bitsToUnsigned(bits.substr(91, 2));
      switch (resetReason) {
        case 0:
          lifecycle.resetReason = "ALL_OK";
          break;
        case 1:
          lifecycle.resetReason = "POWER_ON";
          break;
        case 2:
          lifecycle.resetReason = "WATCHDOG";
          break;
        case 3:
          lifecycle.resetReason = "SOFTWARE";
          break;
        default:
          break;
      }
      break;
    }
    case 3: {
      const uplinkSubType = Bits.bitsToUnsigned(bits.substr(bitsLength - 5, 2));
      switch (uplinkSubType) {
        // Standard Uplink
        case 0: {
          // Reserved 27
          data.zOrientation = Bits.bitsToUnsigned(bits.substr(27, 5)) * 6 - 90;
          data.yOrientation = Bits.bitsToUnsigned(bits.substr(32, 5)) * 6 - 90;
          data.xOrientation = Bits.bitsToUnsigned(bits.substr(37, 5)) * 6 - 90;

          const downlinkValidity = Bits.bitsToUnsigned(bits.substr(42, 2));
          switch (downlinkValidity) {
            case 0:
              lifecycle.downlinkValidity = "DOWNLINK_NOT_RESEVED";
              break;
            case 1:
              lifecycle.downlinkValidity = "DOWNLINK_SUCCSESFUL";
              break;
            case 2:
              lifecycle.downlinkValidity = "DOWNLINK_BOUND_ERROR";
              break;
            case 3:
              lifecycle.downlinkValidity = "DOWNLINK_PROCESSING_FAILED";
              break;
            default:
              break;
          }
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(44, 6)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substr(50, 7)) - 40;
          data.distance = Bits.bitsToUnsigned(bits.substr(57, 9));
          if (data.distance === 511) {
            delete data.distance;
            data.distanceError = "SENSOR_MODULE_NOT_RESPONDING";
          } else if (data.distance === 510) {
            delete data.distance;
            data.distanceError = "LASER_SENSOR_INVALID_CONFIGURATIONS";
          }
          break;
        }
        // Pickup uplink
        case 1: {
          // Reserved 48
          events.tamperEvent = !!Bits.bitsToUnsigned(bits.substr(48, 1));

          data.zOrientation = Bits.bitsToUnsigned(bits.substr(49, 5)) * 6 - 90;
          data.yOrientation = Bits.bitsToUnsigned(bits.substr(54, 5)) * 6 - 90;
          data.xOrientation = Bits.bitsToUnsigned(bits.substr(59, 5)) * 6 - 90;

          events.fireAlarm = !!Bits.bitsToUnsigned(bits.substr(64, 1));
          const pickupType = Bits.bitsToUnsigned(bits.substr(65, 2));
          switch (pickupType) {
            case 0:
              events.pickupAlert = "NONE";
              break;
            case 1:
              events.pickupAlert = "MOTION";
              break;
            case 2:
              events.pickupAlert = "FILL_LEVEL_PERCENTAGE";
              break;
            case 3:
              events.pickupAlert = "MOTION_AND_FILL_LEVEL";
              break;
            default:
              break;
          }

          events.pickupEvent = !!Bits.bitsToUnsigned(bits.substr(67, 1));
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(68, 6)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substr(74, 7)) - 40;
          data.distance = Bits.bitsToUnsigned(bits.substr(81, 9));
          if (data.distance === 511) {
            delete data.distance;
            data.distanceError = "SENSOR_MODULE_NOT_RESPONDING";
          } else if (data.distance === 510) {
            delete data.distance;
            data.distanceError = "LASER_SENSOR_INVALID_CONFIGURATIONS";
          }
          break;
        }
        case 3: {
          // Reserved 16
          system.hardwareVersion = Bits.bitsToUnsigned(bits.substr(16, 8));
          system.softwareVersion = Bits.bitsToUnsigned(bits.substr(24, 16));

          system.totalRuntime = Bits.bitsToUnsigned(bits.substr(40, 11));
          system.totalResetCount = Bits.bitsToUnsigned(bits.substr(51, 6));

          // Reserved
          system.configsTest = Bits.bitsToUnsigned(bits.substr(58, 1));
          system.comTest = Bits.bitsToUnsigned(bits.substr(59, 1));
          system.distanceTest = Bits.bitsToUnsigned(bits.substr(60, 1));
          system.acceleroTest = Bits.bitsToUnsigned(bits.substr(61, 1));
          system.tempTest = Bits.bitsToUnsigned(bits.substr(62, 1));

          const resetReason = Bits.bitsToUnsigned(bits.substr(63, 4));
          switch (resetReason) {
            case 0:
              lifecycle.resetReason = "ALL_OK";
              break;
            case 1:
              lifecycle.resetReason = "POWER_OR_BROWNOUT";
              break;
            case 2:
              lifecycle.resetReason = "WATCHDOG";
              break;
            case 3:
              lifecycle.resetReason = "SOFTWARE";
              break;
            case 4:
              lifecycle.resetReason = "PIN_RESET";
              break;
            case 5:
              lifecycle.resetReason = "CPU_LOCKUP";
              break;
            case 6:
              lifecycle.resetReason = "SYS_OFF_GPYO";
              break;
            case 7:
              lifecycle.resetReason = "VBUS";
              break;
            case 8:
              lifecycle.resetReason = "SYS_OFF_LPCOM";
              break;
            case 9:
              lifecycle.resetReason = "DEBUG_INTERFACE";
              break;
            case 10:
              lifecycle.resetReason = "NFC";
              break;
            case 11:
              lifecycle.resetReason = "SILENT_RESET";
              break;
            case 12:
              lifecycle.resetReason = "RESERVED";
              break;
            case 13:
              lifecycle.resetReason = "RESERVED";
              break;
            default:
              break;
          }
          break;
        }
        // Depth map
        case 4: {
          depth.point8 = Bits.bitsToUnsigned(bits.substr(0, 8));
          depth.point7 = Bits.bitsToUnsigned(bits.substr(8, 8));
          depth.point6 = Bits.bitsToUnsigned(bits.substr(16, 8));
          depth.point5 = Bits.bitsToUnsigned(bits.substr(24, 8));
          depth.point4 = Bits.bitsToUnsigned(bits.substr(32, 8));
          depth.point3 = Bits.bitsToUnsigned(bits.substr(40, 8));
          depth.point2 = Bits.bitsToUnsigned(bits.substr(48, 8));
          depth.point1 = Bits.bitsToUnsigned(bits.substr(56, 8));

          // Reserved 6
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(64, 6)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substr(70, 7)) - 40;

          break;
        }
        // General Fill Level Uplink
        case 5: {
          // Reserved 27
          data.zOrientation = Bits.bitsToUnsigned(bits.substr(27, 5)) * 6 - 90;
          data.yOrientation = Bits.bitsToUnsigned(bits.substr(32, 5)) * 6 - 90;
          data.xOrientation = Bits.bitsToUnsigned(bits.substr(37, 5)) * 6 - 90;

          const downlinkValidity = Bits.bitsToUnsigned(bits.substr(42, 2));
          switch (downlinkValidity) {
            case 0:
              lifecycle.downlinkValidity = "DOWNLINK_NOT_RESEVED";
              break;
            case 1:
              lifecycle.downlinkValidity = "DOWNLINK_SUCCSESFUL";
              break;
            case 2:
              lifecycle.downlinkValidity = "DOWNLINK_BOUND_ERROR";
              break;
            case 3:
              lifecycle.downlinkValidity = "DOWNLINK_PROCESSING_FAILED";
              break;
            default:
              break;
          }
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(44, 6)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substr(50, 7)) - 40;
          // Reserved 2
          fillLevel.fillLevel = Bits.bitsToUnsigned(bits.substr(59, 7));
          if (fillLevel.fillLevel === 127) {
            delete fillLevel.fillLevel;
          }
          break;
        }
        // Multi Points Raw Uplink
        case 6: {
          data.point8 = Bits.bitsToUnsigned(bits.substr(0, 8));
          data.point7 = Bits.bitsToUnsigned(bits.substr(8, 8));
          data.point6 = Bits.bitsToUnsigned(bits.substr(16, 8));
          data.point5 = Bits.bitsToUnsigned(bits.substr(24, 8));
          data.point4 = Bits.bitsToUnsigned(bits.substr(32, 8));
          data.point3 = Bits.bitsToUnsigned(bits.substr(40, 8));
          data.point2 = Bits.bitsToUnsigned(bits.substr(48, 8));
          data.point1 = Bits.bitsToUnsigned(bits.substr(56, 8));

          // Reserved 6
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substr(64, 6)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substr(70, 7)) - 40;
          break;
        }
        // Multi Points Raw Uplink
        case 7: {
          // Reversed order as its not known how many datapoints there all
          const uplinkExtension = Bits.bitsToUnsigned(
            bits.substr(bitsLength - 8, 3),
          );

          if (uplinkExtension === 0) {
            lifecycle.temperature =
              Bits.bitsToUnsigned(bits.substr(bitsLength - 15, 7)) - 40;
            lifecycle.batteryLevel =
              Bits.bitsToUnsigned(bits.substr(bitsLength - 21, 6)) * 2;
            if (lifecycle.batteryLevel === 126) {
              delete lifecycle.batteryLevel;
            }
            lifecycle.measurementInterval = Bits.bitsToUnsigned(
              bits.substr(bitsLength - 32, 11),
            );
            const numberOfPoints = Bits.bitsToUnsigned(
              bits.substr(bitsLength - 38, 6),
            );

            let pointer = 0;
            for (let i = 0; i < numberOfPoints; i++) {
              depth[`point${numberOfPoints + 1}`] = Bits.bitsToUnsigned(
                bits.substr(pointer, 8),
              );
              pointer += 8;
            }
          } else if (uplinkExtension === 1) {
            events.fireAlarm = !!Bits.bitsToUnsigned(
              bits.substr(bitsLength - 9, 1),
            );
            const pickupType = Bits.bitsToUnsigned(
              bits.substr(bitsLength - 11, 2),
            );
            switch (pickupType) {
              case 0:
                events.pickupAlert = "NONE";
                break;
              case 1:
                events.pickupAlert = "MOTION";
                break;
              case 2:
                events.pickupAlert = "FILL_LEVEL_PERCENTAGE";
                break;
              case 3:
                events.pickupAlert = "MOTION_AND_FILL_LEVEL";
                break;
              default:
                break;
            }
            lifecycle.batteryLevel =
              Bits.bitsToUnsigned(bits.substr(bitsLength - 17, 6)) * 2;
            if (lifecycle.batteryLevel === 126) {
              delete lifecycle.batteryLevel;
            }
            events.tamperEvent = !!Bits.bitsToUnsigned(
              bits.substr(bitsLength - 18, 1),
            );
            const downlinkValidity = Bits.bitsToUnsigned(
              bits.substr(bitsLength - 20, 2),
            );
            switch (downlinkValidity) {
              case 0:
                lifecycle.downlinkValidity = "DOWNLINK_NOT_RESEVED";
                break;
              case 1:
                lifecycle.downlinkValidity = "DOWNLINK_SUCCSESFUL";
                break;
              case 2:
                lifecycle.downlinkValidity = "DOWNLINK_BOUND_ERROR";
                break;
              case 3:
                lifecycle.downlinkValidity = "DOWNLINK_PROCESSING_FAILED";
                break;
              default:
                break;
            }
            // Reserved 28
            const txReason = Bits.bitsToUnsigned(
              bits.substr(bitsLength - 52, 4),
            );
            switch (txReason) {
              case 0:
                lifecycle.txReason = "OTHER";
                break;
              case 1:
                lifecycle.txReason = "FIRST";
                break;
              case 2:
                lifecycle.txReason = "TIME_UPDATE";
                break;
              case 3:
                lifecycle.txReason = "BOTH_CHANGE";
                break;
              case 4:
                lifecycle.txReason = "POSITIV_CHANGE";
                break;
              case 5:
                lifecycle.txReason = "NEGATIVE_CHANGE";
                break;
              case 6:
                lifecycle.txReason = "TRANSMIT_INTERVAL";
                break;
              case 7:
                lifecycle.txReason = "MOTION_EVENT_BUFFER_FULL";
                break;
              case 8:
                lifecycle.txReason = "MOTION_EVENT_PICKUP";
                break;
              case 9:
                lifecycle.txReason = "MOTION_EVENT_FIRE_ALARM";
                break;
              case 10:
                lifecycle.txReason = "MOTION_EVENT_TAMPER";
                break;
              default:
                break;
            }
            const numberOfPoints = Bits.bitsToUnsigned(
              bits.substr(bitsLength - 58, 6),
            );
            const numberOfMoitionEvents = Bits.bitsToUnsigned(
              bits.substr(64, 6),
            );

            let pointer = 58;
            for (let i = 0; i < numberOfPoints; i++) {
              const history = {};
              const secondsNow = new Date().getTime();
              pointer += 9;
              const timestamp = new Date(
                secondsNow -
                  Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 9)) *
                    169,
              );

              pointer += 6;
              history.xOrientation =
                Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 6)) * 6 -
                90;
              pointer += 6;
              history.yOrientation =
                Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 6)) * 6 -
                90;
              pointer += 6;
              history.zOrientation =
                Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 6)) * 6 -
                90;

              pointer += 7;
              history.temperature =
                Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 7)) - 40;

              pointer += 9;
              history.distance = Bits.bitsToUnsigned(bits.substr(13, 9));
              if (history.distance === 511) {
                delete history.distance;
                history.distanceError = "SENSOR_MODULE_NOT_RESPONDING";
              } else if (history.distance === 510) {
                delete history.distance;
                history.distanceError = "LASER_SENSOR_INVALID_CONFIGURATIONS";
              }

              emit("sample", {
                data: history,
                topic: "distance_history",
                timestamp,
              });
            }

            for (let i = 0; i < numberOfMoitionEvents; i++) {
              const history = {};
              const secondsNow = new Date().getTime();
              pointer += 16;
              const timestamp = new Date(
                secondsNow -
                  Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 16)) *
                    1.32,
              );

              pointer += 6;
              history.motionOrientation =
                Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 6)) * 3;
              pointer += 6;
              history.motionDeviation =
                Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 6)) * 3;
              pointer += 6;
              history.motionDuration =
                Bits.bitsToUnsigned(bits.substr(bitsLength - pointer, 6)) * 3;

              emit("sample", {
                data: history,
                topic: "motion_history",
                timestamp,
              });
            }
          }
          break;
        }
        default:
          break;
      }
      break;
    }
    default:
      break;
  }

  if (Object.keys(fillLevel).length !== 0) {
    emit("sample", { data: fillLevel, topic: "fill_level" });
  }

  if (Object.keys(distance).length !== 0) {
    emit("sample", { data: distance, topic: "distance" });
  }

  if (Object.keys(system).length !== 0) {
    emit("sample", { data: system, topic: "system" });
  }

  if (Object.keys(events).length !== 0) {
    emit("sample", { data: events, topic: "event" });
  }

  if (Object.keys(lifecycle).length !== 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
