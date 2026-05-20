import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Efento Uplink", () => {
  let consume = null;
  let configurationSchema = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/configuration.schema.json`)
      .then((parsedSchema) => {
        configurationSchema = parsedSchema;
        done();
      });
  });

  let lifecycleSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/lifecycle.schema.json`)
      .then((parsedSchema) => {
        lifecycleSchema = parsedSchema;
        done();
      });
  });

  let measurementsSchema = null;
  before((done) => {
    loadSchema(`${__dirname}/measurements.schema.json`)
      .then((parsedSchema) => {
        measurementsSchema = parsedSchema;
        done();
      });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "configuration");
        assert.equal(value.data.configurationErrorTimestamp, 1779265742);
        assert.deepEqual(value.data.configurationErrors, [
          47887,
          47887,
        ]);
        assert.equal(value.data.modemBandsMask, 2084);
        assert.equal(value.data.measurementPeriodFactor, 1);
        assert.equal(value.data.dataServerPort, 5683);
        assert.equal(value.data.configurationEndpoint, "efento/c");
        assert.equal(value.data.rules.length, 12);
        assert.equal(value.data.measurementPeriodBase, 30);
        assert.equal(value.data.dnsTtlConfig, 864002);
        assert.equal(value.data.configurationHashTimestamp, 1778563312);
        assert.equal(value.data.payloadSplitInfo, 1);
        assert.equal(value.data.transferLimitTimer, 65535);
        assert.equal(value.data.bleTxPowerLevel, 1);
        assert.deepEqual(value.data.cellularConfigParams, [
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
        assert.equal(value.data.dataServerIp, "coap.akenza.io");
        assert.equal(value.data.updateServerPortCoap, 5680);
        assert.equal(value.data.payloadSignatureCoapOption, 65000);
        assert.equal(value.data.updateServerIp, "18.184.24.239");
        assert.equal(value.data.configurationHash, 27);
        assert.equal(value.data.serialNumber, "KCwCQyHT");
        assert.deepEqual(value.data.dnsServerIp, [
          255,
          255,
          255,
          255,
        ]);
        assert.deepEqual(value.data.ledConfig, [
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
        assert.equal(value.data.bleTurnoffTime, 4294967295);
        assert.deepEqual(value.data.channelTypes, [
          "MEASUREMENT_TYPE_CURRENT_PRECISE",
          "MEASUREMENT_TYPE_CURRENT_PRECISE",
          "MEASUREMENT_TYPE_NO_SENSOR",
          "MEASUREMENT_TYPE_NO_SENSOR",
          "MEASUREMENT_TYPE_NO_SENSOR",
          "MEASUREMENT_TYPE_NO_SENSOR",
        ]);
        assert.equal(value.data.networkTroubleshooting, 1);
        assert.equal(value.data.cloudTokenCoapOption, 65000);
        assert.equal(value.data.updateServerPortUdp, 50000);
        assert.equal(value.data.supervisionPeriod, 172800);
        assert.equal(value.data.ackInterval, 4294967295);
        assert.equal(value.data.timeEndpoint, "efento/t");
        assert.equal(value.data.plmnSelection, 4294967295);
        assert.equal(value.data.transferLimit, 65535);
        assert.deepEqual(value.data.calendars, [
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
        assert.equal(value.data.cloudTokenConfig, 1);
        assert.equal(value.data.deviceInfoEndpoint, "efento/i");
        assert.equal(value.data.transmissionInterval, 60);
        assert.equal(value.data.dataEndpoint, "efento/m");
        assert.equal(value.data.networkSearchDisablePeriodBase, 90);
        assert.deepEqual(value.data.networkSearchTimeSchemaLastRegistrationNotOk, [
          21,
          2,
          2,
          4,
          2,
          2,
        ]);
        assert.equal(value.data.networkSearchCounterMax, 8);
        assert.deepEqual(value.data.networkSearchTimeSchemaLastRegistrationOk, [
          2,
          2,
          4,
          2,
          2,
          21,
        ]);
        assert.equal(value.data.bleAdvertisingPeriodMode, "BLE_ADVERTISING_PERIOD_MODE_DEFAULT");
        assert.equal(value.data.bleAdvertisingPeriodNormal, 1636);
        assert.equal(value.data.bleAdvertisingPeriodFast, 818);

        validateSchema(value.data, configurationSchema, {
          throwError: true,
        });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "lifecycle");
        assert.equal(value.data.batteryStatus, "OK");
        assert.equal(value.data.signalStrength, -110);
        assert.equal(value.data.nextTransmissionAt, '2026-05-20T08:35:56Z');

        validateSchema(value.data, lifecycleSchema, {
          throwError: true,
        });
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

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.topic, "measurements");
        assert.equal(value.data.currentPrecise1, 11.796);
        assert.equal(value.data.currentPrecise2, -0.001);
        assert.equal(value.data.measurementInterval, 50);

        validateSchema(value.data, measurementsSchema, {
          throwError: true,
        });
      });

      consume(data);
    });
  });
});
