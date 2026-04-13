

import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Dormakaba Door Sensor Uplink", () => {
  let objectPresentSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/object_present.schema.json`)
      .then((parsedSchema) => {
        objectPresentSchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Dormakaba Door Sensor boot uplink", () => {
      const data = {
        "data": {
          "headers": {
            "msgId": "xxx",
            "msgDomain": "installationManagement",
            "msgName": "<EVENT_NAME>",
            "msgType": "event",
            "msgStatus": "enriched",
            "derivedFrom": [
              "xxxx"
            ],
            "correlationId": "xxxx",
            "producedAt": "2026-02-17T12:28:04.676Z",
            "producedBy": "businessEventProcessing",
            "tenantId": "xxxx",
            "payloadType": "raw",
            "causationId": "xxxx",
            "xCorrelationId": "xxxx"
          },
          "payload": {
            "timestamp": "2025-12-08T09:13:48.433Z",
            "totalCycles": 92557,
            "InstallationLightBarriersUpdated": {
              "timestamp": "2025-12-08T09:13:44.000Z",
              "SensorSignals.LightBarriers": [
                1,
                0
              ]
            },
            "InstallationDoorStatusUpdated": {
              "timestamp": "2025-12-08T09:08:02.000Z",
              "Status.DoorStatus": "closed"
            },
            "InstallationErrorCodeHistoryUpdated": {
              "timestamp": "2025-12-07T20:50:51.000Z",
              "Errors.ErrorCodeHistory": [
                0,
                3,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0
              ]
            },
            "InstallationIndoorSensorsUpdated": {
              "timestamp": "2025-12-08T09:07:58.000Z",
              "SensorSignals.IndoorSensors": [
                0
              ]
            },
            "InstallationPowerFailUpdated": {
              "timestamp": "2025-12-08T08:05:29.000Z",
              "Alerts.PowerFail": false
            },
            "InstallationProgramswitchModeUpdated": {
              "timestamp": "2025-12-07T20:50:54.000Z",
              "Status.ProgramswitchMode": "automatic"
            },
            "InstallationDueMaintenanceCyclesUpdated": {
              "timestamp": "2025-12-07T20:50:50.000Z",
              "Maintenance.DueMaintenanceCycles": true
            },
            "InstallationDoorCyclesAfterMaintenanceUpdated": {
              "timestamp": "2025-12-08T09:13:44.000Z",
              "Maintenance.DoorCyclesAfterMaintenance": 92557
            },
            "InstallationOperatingHoursBatteryUpdated": {
              "timestamp": "2025-12-08T08:55:07.000Z",
              "Maintenance.OperatingHoursBattery": 9402
            },
            "InstallationDoorForcedUpdated": {
              "timestamp": "2025-12-07T20:50:51.000Z",
              "Alerts.DoorForced": false
            },
            "InstallationSafetySensorsMCEUpdated": {
              "timestamp": "2025-12-07T20:50:54.000Z",
              "SensorSignals.SafetySensorsMCE": [
                0
              ]
            },
            "InstallationSabotageUpdated": {
              "timestamp": "2025-12-07T20:50:50.000Z",
              "Alerts.Sabotage": false
            },
            "InstallationDoorCyclesUpdated": {
              "timestamp": "2025-12-08T09:13:43.000Z",
              "Maintenance.DoorCycles": 92557
            },
            "InstallationOperatingHoursUpdated": {
              "timestamp": "2025-12-08T08:55:07.000Z",
              "Maintenance.OperatingHours": 9402
            },
            "InstallationCalibrationNecessaryUpdated": {
              "timestamp": "2025-12-07T20:50:50.000Z",
              "Alerts.CalibrationNecessary": false
            },
            "InstallationCurrentErrorsUpdated": {
              "timestamp": "2025-12-07T20:50:50.000Z",
              "Errors.CurrentErrors": [
                0
              ]
            },
            "InstallationOutdoorSensorsUpdated": {
              "timestamp": "2025-12-08T09:13:44.000Z",
              "SensorSignals.OutdoorSensors": [
                0
              ]
            },
            "InstallationDueMaintenanceIntervalUpdated": {
              "timestamp": "2025-12-07T20:50:49.000Z",
              "Maintenance.DueMaintenanceInterval": true
            },
            "InstallationLockStateDoorLockUpdated": {
              "timestamp": "2025-12-07T20:50:54.000Z",
              "Status.LockStateDoorLock": "noLock"
            },
            "InstallationSafetySensorsSCEUpdated": {
              "timestamp": "2025-12-07T20:50:54.000Z",
              "SensorSignals.SafetySensorsSCE": [
                0,
                0
              ]
            },
            "InstallationInputSignalsUpdated": {
              "timestamp": "2025-12-08T04:03:47.000Z",
              "InputSignals": [
                {
                  "name": "EmergencyExit",
                  "value": 1
                }
              ]
            }
          },
          "timestamp": "2026-02-17T12:28:05.052Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "system");
        assert.equal(value.data.calibrationNecessary, false);
        assert.deepEqual(value.data.currentErrros, [0]);
        assert.equal(value.data.cyclesAfterMaintenance, 92557);
        assert.equal(value.data.doorCycles, 92557);
        assert.equal(value.data.doorForced, false);
        assert.equal(value.data.doorStatus, "CLOSED");
        assert.equal(value.data.dueMaintenanceCycles, true);
        assert.equal(value.data.dueMaintenanceInterval, true);
        assert.deepEqual(value.data.errorHistory, [0, 3, 0, 0, 0, 0, 0, 0, 0, 0]);
        assert.deepEqual(value.data.indoorSensors, [0]);
        assert.exists(value.data.inputSignals);
        assert.deepEqual(value.data.lightBarriers, [1, 0]);
        assert.equal(value.data.lockState, 'NOLOCK');
        assert.equal(value.data.operatingHours, 9402);
        assert.equal(value.data.operatingHoursBattery, 9402);
        assert.deepEqual(value.data.outdoorSensors, [0]);
        assert.equal(value.data.powerFail, false);
        assert.equal(value.data.programSwitchMode, "AUTOMATIC");
        assert.equal(value.data.sabotageDetected, false);
        assert.deepEqual(value.data.safetySensorMCE, [0, 0]);
        assert.equal(value.data.totalCycles, 92557);

        /*
                validateSchema(value.data, systemSchema, {
                  throwError: true,
                });
                */
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("Should decode the Dormakaba Door Sensor physical change uplink", () => {
      const data = {
        "data": {
          "headers": {
            "msgId": "xxx",
            "msgDomain": "installationManagement",
            "msgName": "<EVENT_NAME>",
            "msgType": "event",
            "msgStatus": "enriched",
            "derivedFrom": [
              "xxxx"
            ],
            "correlationId": "xxxx",
            "producedAt": "2026-02-17T12:28:04.676Z",
            "producedBy": "businessEventProcessing",
            "tenantId": "xxxx",
            "payloadType": "raw",
            "causationId": "xxxx",
            "xCorrelationId": "xxxx"
          },
          "payload": {
            "doorPhysicalState": "closed",
            "timestamp": "2025-12-08T09:08:02.000Z"
          },
          "timestamp": "2026-02-17T12:28:05.052Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_state");
        assert.equal(value.data.state, "CLOSED");
        assert.equal(value.data.open, false);
        /*
        validateSchema(value.data, doorStateSchema, {
          throwError: true,
        });
        */
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("Should decode the Dormakaba Door Sensor lock change uplink", () => {
      const data = {
        "data": {
          "headers": {
            "msgId": "xxx",
            "msgDomain": "installationManagement",
            "msgName": "<EVENT_NAME>",
            "msgType": "event",
            "msgStatus": "enriched",
            "derivedFrom": [
              "xxxx"
            ],
            "correlationId": "xxxx",
            "producedAt": "2026-02-17T12:28:04.676Z",
            "producedBy": "businessEventProcessing",
            "tenantId": "xxxx",
            "payloadType": "raw",
            "causationId": "xxxx",
            "xCorrelationId": "xxxx"
          },
          "payload": {
            "doorLockState": "locked",
            "timestamp": "2025-12-08T09:12:32.000Z"
          },
          "timestamp": "2026-02-17T12:28:05.052Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lock");
        assert.equal(value.data.locked, true);
        assert.equal(value.data.state, "LOCKED");
        /*
        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
        */
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("Should decode the Dormakaba Door Sensor door cycle change uplink", () => {
      const data = {
        "data": {
          "headers": {
            "msgId": "xxx",
            "msgDomain": "installationManagement",
            "msgName": "<EVENT_NAME>",
            "msgType": "event",
            "msgStatus": "enriched",
            "derivedFrom": [
              "xxxx"
            ],
            "correlationId": "xxxx",
            "producedAt": "2026-02-17T12:28:04.676Z",
            "producedBy": "businessEventProcessing",
            "tenantId": "xxxx",
            "payloadType": "raw",
            "causationId": "xxxx",
            "xCorrelationId": "xxxx"
          },
          "payload": {
            "doorCycle": 92559,
            "timestamp": "2025-12-08T09:15:55.000Z"
          },
          "timestamp": "2026-02-17T12:28:05.052Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "door_count");
        assert.equal(value.data.doorClosings, 0);
        assert.equal(value.data.usageCount, 0);

        /*
        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
        */
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "default");
        assert.equal(value.data.absoluteCount, 92559);
        assert.equal(value.data.relativeCount, 0);

        /*
        validateSchema(value.data, doorCountSchema, {
          throwError: true,
        });
        */
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.typeOf(value, "object");
      });

      consume(data);
    });

    it("Should decode the Dormakaba Door Sensor mode change uplink", () => {
      const data = {
        "data": {
          "headers": {
            "msgId": "xxx",
            "msgDomain": "installationManagement",
            "msgName": "<EVENT_NAME>",
            "msgType": "event",
            "msgStatus": "enriched",
            "derivedFrom": [
              "xxxx"
            ],
            "correlationId": "xxxx",
            "producedAt": "2026-02-17T12:28:04.676Z",
            "producedBy": "businessEventProcessing",
            "tenantId": "xxxx",
            "payloadType": "raw",
            "causationId": "xxxx",
            "xCorrelationId": "xxxx"
          },
          "payload": {
            "pgsPosition": "off",
            "timestamp": "2025-12-04T10:37:08.597Z"
          },
          "timestamp": "2026-02-17T12:28:05.052Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "mode_change");
        assert.equal(value.data.pgsPosition, "OFF");

        /*
        validateSchema(value.data, modeChangeSchema, {
          throwError: true,
        });
        */
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.typeOf(value, "object");
      });

      consume(data);
    });


    it("Should decode the Dormakaba Door Sensor connection status change uplink", () => {
      const data = {
        "data": {
          "headers": {
            "msgId": "xxx",
            "msgDomain": "installationManagement",
            "msgName": "<EVENT_NAME>",
            "msgType": "event",
            "msgStatus": "enriched",
            "derivedFrom": [
              "xxxx"
            ],
            "correlationId": "xxxx",
            "producedAt": "2026-02-17T12:28:04.676Z",
            "producedBy": "businessEventProcessing",
            "tenantId": "xxxx",
            "payloadType": "raw",
            "causationId": "xxxx",
            "xCorrelationId": "xxxx"
          },
          "payload": {
            "isConnected": true,
            "timestamp": "2026-02-05T12:37:54.473Z"
          },
          "timestamp": "2026-02-17T12:28:05.052Z"
        }
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "connection_status");
        assert.equal(value.data.isConnected, true);

        /*
        validateSchema(value.data, connectionStatusSchema, {
          throwError: true,
        });
        */
      });

      expectEmits((type, value) => {
        assert.equal(type, "state");
        assert.typeOf(value, "object");
      });

      consume(data);
    });
  });
});
