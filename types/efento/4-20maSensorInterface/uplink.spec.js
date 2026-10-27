import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Efento Uplink", () => {
  let consume = null;
  let configurationSchema = null;
  let lifecycleSchema = null;
  let measurementsSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    configurationSchema = loadSchema(`${import.meta.dirname}/configuration.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    measurementsSchema = loadSchema(`${import.meta.dirname}/measurements.schema.json`);
  });

  describe("consume()", () => {
    it("Should decode the efento configuration", () => {
      const data = {
        "data": {
          "configurationErrorTimestamp": 1779265742,
          "configurationErrors": [
            47887,
            47887
          ],
          "modemBandsMask": 2084,
          "measurementPeriodFactor": 1,
          "networkSearch": {
            "disablePeriodBase": 90,
            "timeSchemaLastRegistrationNotOk": [
              21,
              2,
              2,
              4,
              2,
              2
            ],
            "counterMax": 8,
            "timeSchemaLastRegistrationOk": [
              2,
              2,
              4,
              2,
              2,
              21
            ]
          },
          "dataServerPort": 5683,
          "configurationEndpoint": "efento/c",
          "rules": [
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            },
            {
              "condition": "CONDITION_DISABLED"
            }
          ],
          "measurementPeriodBase": 30,
          "dnsTtlConfig": 864002,
          "configurationHashTimestamp": 1778563312,
          "payloadSplitInfo": 1,
          "apnPassword": "",
          "transferLimitTimer": 65535,
          "bleTxPowerLevel": 1,
          "cellularConfigParams": [
            13,
            2,
            61,
            2,
            4,
            1,
            2,
            15,
            2,
            1,
            5,
            2,
            2,
            1,
            0,
            0
          ],
          "dataServerIp": "coap.akenza.io",
          "updateServerPortCoap": 5680,
          "payloadSignatureCoapOption": 65000,
          "apn": "",
          "apnUsername": "",
          "updateServerIp": "18.184.24.239",
          "configurationHash": 27,
          "serialNumber": "KCwCQyHT",
          "dnsServerIp": [
            255,
            255,
            255,
            255
          ],
          "ledConfig": [
            3,
            18,
            255,
            255,
            20,
            20,
            20,
            20,
            8
          ],
          "bleTurnoffTime": 4294967295,
          "channelTypes": [
            "MEASUREMENT_TYPE_CURRENT_PRECISE",
            "MEASUREMENT_TYPE_CURRENT_PRECISE",
            "MEASUREMENT_TYPE_NO_SENSOR",
            "MEASUREMENT_TYPE_NO_SENSOR",
            "MEASUREMENT_TYPE_NO_SENSOR",
            "MEASUREMENT_TYPE_NO_SENSOR"
          ],
          "networkTroubleshooting": 1,
          "cloudTokenCoapOption": 65000,
          "bleAdvertisingPeriod": {
            "mode": "BLE_ADVERTISING_PERIOD_MODE_DEFAULT",
            "normal": 1636,
            "fast": 818
          },
          "updateServerPortUdp": 50000,
          "supervisionPeriod": 172800,
          "ackInterval": 4294967295,
          "timeEndpoint": "efento/t",
          "plmnSelection": 4294967295,
          "transferLimit": 65535,
          "calendars": [
            {
              "type": "CALENDAR_TYPE_DISABLED"
            },
            {
              "type": "CALENDAR_TYPE_DISABLED"
            },
            {
              "type": "CALENDAR_TYPE_DISABLED"
            },
            {
              "type": "CALENDAR_TYPE_DISABLED"
            },
            {
              "type": "CALENDAR_TYPE_DISABLED"
            },
            {
              "type": "CALENDAR_TYPE_DISABLED"
            }
          ],
          "cloudTokenConfig": 1,
          "deviceInfoEndpoint": "efento/i",
          "transmissionInterval": 60,
          "dataEndpoint": "efento/m"
        },
        "uplinkMetrics": {
          "emittedUplinkMetrics": false,
          "uplinkSize": 2139,
          "uplinkId": "8d751179-c8d9-41db-b3cb-bb82621914c2",
          "id": "03cdaaf853f6b5e6",
          "updateUplinkMetrics": true,
          "deviceId": "02724fdef1ba1a49",
          "timestamp": "2026-05-20T08:29:02.839048301Z"
        },
        "topic": "configuration",
        "state": {},
        "device": {
          "connectivity": "COAP",
          "customFields": {},
          "name": "EFENTO 4-20mA Test",
          "description": "Datenlogger test EFENTO",
          "id": "02724fdef1ba1a49",
          "deviceId": "282C024321D3",
          "workspaceId": "299b05ffdecdbe2c",
          "tags": []
        },
        "timestamp": "2026-05-20T08:29:02.839048301Z"
      };

      expectSample("configuration", configurationSchema, (data) => {
        assert.equal(data.configurationErrorTimestamp, 1779265742);
        assert.deepEqual(data.configurationErrors, [
          47887,
          47887,
        ]);
        assert.equal(data.modemBandsMask, 2084);
        assert.equal(data.measurementPeriodFactor, 1);
        assert.equal(data.dataServerPort, 5683);
        assert.equal(data.configurationEndpoint, "efento/c");
        assert.equal(data.rules.length, 12);
        assert.equal(data.measurementPeriodBase, 30);
        assert.equal(data.dnsTtlConfig, 864002);
        assert.equal(data.configurationHashTimestamp, 1778563312);
        assert.equal(data.payloadSplitInfo, 1);
        assert.equal(data.transferLimitTimer, 65535);
        assert.equal(data.bleTxPowerLevel, 1);
        assert.deepEqual(data.cellularConfigParams, [
          13,
          2,
          61,
          2,
          4,
          1,
          2,
          15,
          2,
          1,
          5,
          2,
          2,
          1,
          0,
          0,
        ]);
        assert.equal(data.dataServerIp, "coap.akenza.io");
        assert.equal(data.updateServerPortCoap, 5680);
        assert.equal(data.payloadSignatureCoapOption, 65000);
        assert.equal(data.updateServerIp, "18.184.24.239");
        assert.equal(data.configurationHash, 27);
        assert.equal(data.serialNumber, "KCwCQyHT");
        assert.deepEqual(data.dnsServerIp, [
          255,
          255,
          255,
          255,
        ]);
        assert.deepEqual(data.ledConfig, [
          3,
          18,
          255,
          255,
          20,
          20,
          20,
          20,
          8,
        ]);
        assert.equal(data.bleTurnoffTime, 4294967295);
        assert.deepEqual(data.channelTypes, [
          "MEASUREMENT_TYPE_CURRENT_PRECISE",
          "MEASUREMENT_TYPE_CURRENT_PRECISE",
          "MEASUREMENT_TYPE_NO_SENSOR",
          "MEASUREMENT_TYPE_NO_SENSOR",
          "MEASUREMENT_TYPE_NO_SENSOR",
          "MEASUREMENT_TYPE_NO_SENSOR",
        ]);
        assert.equal(data.networkTroubleshooting, 1);
        assert.equal(data.cloudTokenCoapOption, 65000);
        assert.equal(data.updateServerPortUdp, 50000);
        assert.equal(data.supervisionPeriod, 172800);
        assert.equal(data.ackInterval, 4294967295);
        assert.equal(data.timeEndpoint, "efento/t");
        assert.equal(data.plmnSelection, 4294967295);
        assert.equal(data.transferLimit, 65535);
        assert.deepEqual(data.calendars, [
          {
            type: "CALENDAR_TYPE_DISABLED",
          },
          {
            type: "CALENDAR_TYPE_DISABLED",
          },
          {
            type: "CALENDAR_TYPE_DISABLED",
          },
          {
            type: "CALENDAR_TYPE_DISABLED",
          },
          {
            type: "CALENDAR_TYPE_DISABLED",
          },
          {
            type: "CALENDAR_TYPE_DISABLED",
          },
        ]);
        assert.equal(data.cloudTokenConfig, 1);
        assert.equal(data.deviceInfoEndpoint, "efento/i");
        assert.equal(data.transmissionInterval, 60);
        assert.equal(data.dataEndpoint, "efento/m");
        assert.equal(data.networkSearchDisablePeriodBase, 90);
        assert.deepEqual(data.networkSearchTimeSchemaLastRegistrationNotOk, [
          21,
          2,
          2,
          4,
          2,
          2,
        ]);
        assert.equal(data.networkSearchCounterMax, 8);
        assert.deepEqual(data.networkSearchTimeSchemaLastRegistrationOk, [
          2,
          2,
          4,
          2,
          2,
          21,
        ]);
        assert.equal(data.bleAdvertisingPeriodMode, "BLE_ADVERTISING_PERIOD_MODE_DEFAULT");
        assert.equal(data.bleAdvertisingPeriodNormal, 1636);
        assert.equal(data.bleAdvertisingPeriodFast, 818);
      });

      consume(data);
    });

    it("Should decode the efento lifecycle", () => {
      const data = {
        "data": {
          "batteryStatus": true,
          "signal": 0,
          "nextTransmissionAt": "2026-05-20T08:35:56Z"
        },
        "uplinkMetrics": {
          "emittedUplinkMetrics": false,
          "uplinkSize": 77,
          "uplinkId": "04ff5894-a9c5-4d83-bbdd-213aa57210a0",
          "id": "032028f4ca3ceeae",
          "updateUplinkMetrics": true,
          "deviceId": "02724fdef1ba1a49",
          "timestamp": "2026-05-20T08:29:01.486719220Z"
        },
        "topic": "lifecycle",
        "state": {},
        "device": {
          "connectivity": "COAP",
          "customFields": {},
          "name": "EFENTO 4-20mA Test",
          "description": "Datenlogger test EFENTO",
          "id": "02724fdef1ba1a49",
          "deviceId": "282C024321D3",
          "workspaceId": "299b05ffdecdbe2c",
          "tags": []
        },
        "timestamp": "2026-05-20T08:29:01.486719220Z"
      };

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.batteryStatus, "OK");
        assert.equal(data.signalStrength, -110);
        assert.equal(data.nextTransmissionAt, '2026-05-20T08:35:56Z');
      });

      consume(data);
    });

    it("should decode the efento measurements", () => {
      const data = {
        "data": {
          "currentPrecise1": 11.796,
          "currentPrecise2": -0.001,
          "measurementInterval": 50,
        },
        "uplinkMetrics": {
          "emittedUplinkMetrics": false,
          "uplinkSize": 51,
          "uplinkId": "04ff5894-a9c5-4d83-bbdd-213aa57210a0",
          "id": "0330f204beec541f",
          "updateUplinkMetrics": true,
          "deviceId": "02724fdef1ba1a49",
          "timestamp": "2026-05-20T08:28:30Z"
        },
        "topic": "measurements",
        "state": {},
        "device": {
          "connectivity": "COAP",
          "customFields": {},
          "name": "EFENTO 4-20mA Test",
          "description": "Datenlogger test EFENTO",
          "id": "02724fdef1ba1a49",
          "deviceId": "282C024321D3",
          "workspaceId": "299b05ffdecdbe2c",
          "tags": []
        },
        "timestamp": "2026-05-20T08:28:30Z"
      };

      expectSample("measurements", measurementsSchema, (data) => {
        assert.equal(data.currentPrecise1, 11.796);
        assert.equal(data.currentPrecise2, -0.001);
        assert.equal(data.measurementInterval, 50);
      });

      consume(data);
    });
  });
});
