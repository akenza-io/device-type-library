function resetReason(flag) {
  let reason = "UNKNOWN";

  switch (flag) {
    case 0:
      reason = "CLEARED";
      break;
    case 1:
      reason = "POWER_OR_BROWNOUT";
      break;
    case 2:
      reason = "WATCH_DOG";
      break;
    case 3:
      reason = "SOFTWARE/OTHER_RESETS";
      break;
    case 4:
      reason = "PIN_RESET";
      break;
    case 5:
      reason = "CPU_LOCKUP";
      break;
    case 6:
      reason = "SYS_OFF_GPIO";
      break;
    case 7:
      reason = "VBUS";
      break;
    case 8:
      reason = "SYS_OFF_LPCOM";
      break;
    case 9:
      reason = "DEBUG_INTERFACE";
      break;
    case 10:
      reason = "NFC";
      break;
    case 11:
      reason = "SILENT_RESET_DOWNLINK";
      break;
    case 12:
      reason = "RECOVERY_TIMEOUT";
      break;
    case 13:
      reason = "RECOVERY_OVERFLOW";
      break;
    case 14:
      reason = "RECOVERY_TIMEOUT_OVERFLOW";
      break;
    default:
      break;
  }
  return reason;
}

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
  const orientation = {};
  const bitsLength = bits.length;

  const uplinkType = Bits.bitsToUnsigned(bits.substring(bitsLength - 2));
  switch (uplinkType) {
    // Filllevel
    case 0: {
      lifecycle.resetReason = resetReason(
        Bits.bitsToUnsigned(bits.substring(0, 2)),
      );

      lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(2, 8)) * 2;
      if (lifecycle.batteryLevel === 126) {
        delete data.batteryLevel;
      }

      lifecycle.temperature = Bits.bitsToUnsigned(bits.substring(8, 15)) - 40;
      fillLevel.fillLevel = Bits.bitsToUnsigned(bits.substring(15, 22));
      if (fillLevel.fillLevel === 127) {
        delete fillLevel.fillLevel;
      }
      break;
    }
    // Distance
    case 1: {
      lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(0, 6)) * 2;
      if (lifecycle.batteryLevel === 126) {
        delete lifecycle.batteryLevel;
      }
      lifecycle.temperature = Bits.bitsToUnsigned(bits.substring(6, 13)) - 40;
      distance.distance = Bits.bitsToUnsigned(bits.substring(13, 22));
      if (distance.distance === 511) {
        delete distance.distance;
        distance.distanceError = "SENSOR_MODULE_NOT_RESPONDING";
      } else if (distance.distance === 510) {
        delete distance.distance;
        distance.distanceError = "LASER_SENSOR_INVALID_CONFIGURATIONS";
      }

      if (event.device !== undefined && distance.distance !== undefined) {
        if (event.device.customFields !== undefined) {
          const { customFields } = event.device;
          let scaleLength = null;
          let sensorDistance = 0;

          if (customFields.containerHeight !== undefined) {
            scaleLength = Number(event.device.customFields.containerHeight);
          }

          if (customFields.installationOffset !== undefined) {
            sensorDistance = Number(
              event.device.customFields.installationOffset,
            );
          }

          if (scaleLength !== null) {
            const percentExact =
              (100 / scaleLength) *
              (scaleLength - (distance.distance - sensorDistance));
            let fillpercent = Math.round(percentExact);
            if (fillpercent > 100) {
              fillpercent = 100;
            } else if (fillpercent < 0) {
              fillpercent = 0;
            }
            distance.fillLevel = fillpercent;
          }
        }
      }

      break;
    }
    // System
    case 2: {
      // Dev EUI 24
      // Reserved 6
      system.hardwareVersion = Bits.bitsToUnsigned(bits.substring(30, 36));
      system.softwareVersion = `${Bits.bitsToUnsigned(
        bits.substring(42, 44),
      )}.${Bits.bitsToUnsigned(bits.substring(36, 42))}.${Bits.bitsToUnsigned(
        bits.substring(44, 50),
      )}`;
      system.noOfDownlinks = Bits.bitsToUnsigned(bits.substring(50, 52));
      system.downlinkFreq = Bits.bitsToUnsigned(bits.substring(52, 54));
      system.totalResetCount = Bits.bitsToUnsigned(bits.substring(54, 61));
      system.runtime = Bits.bitsToUnsigned(bits.substring(61, 73));
      // Reserved 1
      system.communicationTest = !!Bits.bitsToUnsigned(bits.substring(74, 75));
      // Reserved 1
      system.distanceTest = !!Bits.bitsToUnsigned(bits.substring(76, 77));
      system.temperatureTest = !!Bits.bitsToUnsigned(bits.substring(77, 78));
      // Reserved 3
      lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(81, 87)) * 2;
      if (lifecycle.batteryLevel === 126) {
        delete lifecycle.batteryLevel;
      }
      lifecycle.batteryVoltage =
        (Bits.bitsToUnsigned(bits.substring(87, 91)) * 100 + 2200) / 1000;
      lifecycle.resetReason = resetReason(
        Bits.bitsToUnsigned(bits.substring(91, 93)),
      );
      break;
    }
    case 3: {
      const uplinkSubType = Bits.bitsToUnsigned(bits.substring(bitsLength - 5, bitsLength - 3));
      switch (uplinkSubType) {
        // Standard Uplink
        case 0: {
          // Reserved 27
          data.zOrientation = Bits.bitsToUnsigned(bits.substring(27, 32)) * 6 - 90;
          data.yOrientation = Bits.bitsToUnsigned(bits.substring(32, 37)) * 6 - 90;
          data.xOrientation = Bits.bitsToUnsigned(bits.substring(37, 42)) * 6 - 90;

          const downlinkValidity = Bits.bitsToUnsigned(bits.substring(42, 44));
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
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(44, 50)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substring(50, 57)) - 40;
          data.distance = Bits.bitsToUnsigned(bits.substring(57, 66));
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
          events.tamperEvent = !!Bits.bitsToUnsigned(bits.substring(48, 49));

          orientation.zOrientation =
            Bits.bitsToUnsigned(bits.substring(49, 54)) * 6 - 90;
          orientation.yOrientation =
            Bits.bitsToUnsigned(bits.substring(54, 59)) * 6 - 90;
          orientation.xOrientation =
            Bits.bitsToUnsigned(bits.substring(59, 64)) * 6 - 90;

          events.fireAlarm = !!Bits.bitsToUnsigned(bits.substring(64, 65));
          const pickupType = Bits.bitsToUnsigned(bits.substring(65, 67));
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

          events.pickupEvent = !!Bits.bitsToUnsigned(bits.substring(67, 68));
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(68, 74)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substring(74, 81)) - 40;
          data.distance = Bits.bitsToUnsigned(bits.substring(81, 90));
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
          system.hardwareVersion = Bits.bitsToUnsigned(bits.substring(16, 24));
          system.softwareVersion = Bits.bitsToUnsigned(bits.substring(24, 40));

          system.totalRuntime = Bits.bitsToUnsigned(bits.substring(40, 51));
          system.totalResetCount = Bits.bitsToUnsigned(bits.substring(51, 57));

          // Reserved
          system.configsTest = Bits.bitsToUnsigned(bits.substring(58, 59));
          system.communicationTest = Bits.bitsToUnsigned(bits.substring(59, 60));
          system.distanceTest = Bits.bitsToUnsigned(bits.substring(60, 61));
          system.accelerationTest = Bits.bitsToUnsigned(bits.substring(61, 62));
          system.temperatureTest = Bits.bitsToUnsigned(bits.substring(62, 63));

          lifecycle.resetReason = resetReason(
            Bits.bitsToUnsigned(bits.substring(63, 67)),
          );
          break;
        }
        // Depth map
        case 4: {
          depth.point8 = Bits.bitsToUnsigned(bits.substring(0, 8));
          depth.point7 = Bits.bitsToUnsigned(bits.substring(8, 16));
          depth.point6 = Bits.bitsToUnsigned(bits.substring(16, 24));
          depth.point5 = Bits.bitsToUnsigned(bits.substring(24, 32));
          depth.point4 = Bits.bitsToUnsigned(bits.substring(32, 40));
          depth.point3 = Bits.bitsToUnsigned(bits.substring(40, 48));
          depth.point2 = Bits.bitsToUnsigned(bits.substring(48, 56));
          depth.point1 = Bits.bitsToUnsigned(bits.substring(56, 64));

          // Reserved 6
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(64, 70)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substring(70, 77)) - 40;

          break;
        }
        // General Fill Level Uplink
        case 5: {
          // Reserved 27
          orientation.zOrientation =
            Bits.bitsToUnsigned(bits.substring(27, 32)) * 6 - 90;
          orientation.yOrientation =
            Bits.bitsToUnsigned(bits.substring(32, 37)) * 6 - 90;
          orientation.xOrientation =
            Bits.bitsToUnsigned(bits.substring(37, 42)) * 6 - 90;

          const downlinkValidity = Bits.bitsToUnsigned(bits.substring(42, 44));
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
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(44, 50)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substring(50, 57)) - 40;
          // Reserved 2
          fillLevel.fillLevel = Bits.bitsToUnsigned(bits.substring(59, 66));
          if (fillLevel.fillLevel === 127) {
            delete fillLevel.fillLevel;
          }
          break;
        }
        // Multi Points Raw Uplink
        case 6: {
          depth.point8 = Bits.bitsToUnsigned(bits.substring(0, 8));
          depth.point7 = Bits.bitsToUnsigned(bits.substring(8, 16));
          depth.point6 = Bits.bitsToUnsigned(bits.substring(16, 24));
          depth.point5 = Bits.bitsToUnsigned(bits.substring(24, 32));
          depth.point4 = Bits.bitsToUnsigned(bits.substring(32, 40));
          depth.point3 = Bits.bitsToUnsigned(bits.substring(40, 48));
          depth.point2 = Bits.bitsToUnsigned(bits.substring(48, 56));
          depth.point1 = Bits.bitsToUnsigned(bits.substring(56, 64));

          // Reserved 6
          lifecycle.batteryLevel = Bits.bitsToUnsigned(bits.substring(64, 70)) * 2;
          if (lifecycle.batteryLevel === 126) {
            delete lifecycle.batteryLevel;
          }
          lifecycle.temperature = Bits.bitsToUnsigned(bits.substring(70, 77)) - 40;
          break;
        }
        // Multi Points Raw Uplink
        case 7: {
          // Reversed order as its not known how many datapoints there all
          const uplinkExtension = Bits.bitsToUnsigned(
            bits.substring(bitsLength - 8, bitsLength - 5),
          );

          if (uplinkExtension === 0) {
            lifecycle.temperature =
              Bits.bitsToUnsigned(bits.substring(bitsLength - 15, bitsLength - 8)) - 40;
            lifecycle.batteryLevel =
              Bits.bitsToUnsigned(bits.substring(bitsLength - 21, bitsLength - 15)) * 2;
            if (lifecycle.batteryLevel === 126) {
              delete lifecycle.batteryLevel;
            }
            lifecycle.measurementInterval = Bits.bitsToUnsigned(
              bits.substring(bitsLength - 32, bitsLength - 22),
            );
            const numberOfPoints = Bits.bitsToUnsigned(
              bits.substring(bitsLength - 38, bitsLength - 32),
            );

            let pointer = 0;
            for (let i = 0; i < numberOfPoints; i++) {
              depth[`point${numberOfPoints + 1}`] = Bits.bitsToUnsigned(
                bits.substring(pointer, pointer + 8),
              );
              pointer += 8;
            }
          } else if (uplinkExtension === 1) {
            events.fireAlarm = !!Bits.bitsToUnsigned(
              bits.substring(bitsLength - 9, bitsLength - 8),
            );
            const pickupType = Bits.bitsToUnsigned(
              bits.substring(bitsLength - 11, bitsLength - 9),
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
              Bits.bitsToUnsigned(bits.substring(bitsLength - 17, bitsLength - 11)) * 2;
            if (lifecycle.batteryLevel === 126) {
              delete lifecycle.batteryLevel;
            }
            events.tamperEvent = !!Bits.bitsToUnsigned(
              bits.substring(bitsLength - 18, bitsLength - 17),
            );
            const downlinkValidity = Bits.bitsToUnsigned(
              bits.substring(bitsLength - 20, bitsLength - 18),
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
              bits.substring(bitsLength - 52, bitsLength - 48),
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
              bits.substring(bitsLength - 58, bitsLength - 52),
            );
            const numberOfMotionEvents = Bits.bitsToUnsigned(
              bits.substring(64, 70),
            );

            let pointer = 58;
            for (let i = 0; i < numberOfPoints; i++) {
              const history = {};
              const secondsNow = new Date().getTime();
              pointer += 9;
              const timestamp = new Date(
                secondsNow -
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 9)) *
                169,
              );

              pointer += 6;
              history.xOrientation =
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 6)) * 6 -
                90;
              pointer += 6;
              history.yOrientation =
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 6)) * 6 -
                90;
              pointer += 6;
              history.zOrientation =
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 6)) * 6 -
                90;

              pointer += 7;
              history.temperature =
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 7)) - 40;

              pointer += 9;
              history.distance = Bits.bitsToUnsigned(bits.substring(13, 22));
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

            for (let i = 0; i < numberOfMotionEvents; i++) {
              const history = {};
              const secondsNow = new Date().getTime();
              pointer += 16;
              const timestamp = new Date(
                secondsNow -
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 16)) *
                1.32,
              );

              pointer += 6;
              history.motionOrientation =
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 6)) * 3;
              pointer += 6;
              history.motionDeviation =
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 6)) * 3;
              pointer += 6;
              history.motionDuration =
                Bits.bitsToUnsigned(bits.substring(bitsLength - pointer, bitsLength - pointer + 6)) * 3;

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

  if (Object.keys(depth).length !== 0) {
    emit("sample", { data: depth, topic: "depth" });
  }

  if (Object.keys(distance).length !== 0) {
    emit("sample", { data: distance, topic: "distance" });
  }

  if (Object.keys(events).length !== 0) {
    emit("sample", { data: events, topic: "event" });
  }

  if (Object.keys(fillLevel).length !== 0) {
    emit("sample", { data: fillLevel, topic: "fill_level" });
  }

  if (Object.keys(orientation).length !== 0) {
    emit("sample", { data: orientation, topic: "orientation" });
  }

  if (Object.keys(system).length !== 0) {
    emit("sample", { data: system, topic: "system" });
  }

  if (Object.keys(lifecycle).length !== 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
}
