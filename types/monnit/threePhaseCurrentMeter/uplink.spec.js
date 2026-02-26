import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectEmits, validateSchema } from "test-utils";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Monnit Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  before((done) => {
    const script = rewire(`${__dirname}/uplink.js`);
    consume = init(script);
    loadSchema(`${__dirname}/default.schema.json`)
      .then((parsedSchema) => {
        defaultSchema = parsedSchema;
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

  let gatewaySchema = null;
  before((done) => {
    loadSchema(`${__dirname}/gateway.schema.json`)
      .then((parsedSchema) => {
        gatewaySchema = parsedSchema;
        done();
      });
  });

  describe("consume()", () => {
    it("should decode the Monnit Sensor payload", () => {
      const data = {
        data: {
          "sensorMessages": [
            {
              "sensorID": "1076402",
              "sensorName": "ThreePhaseCurrentMeter500 - 1076402",
              "applicationID": "129",
              "networkID": "140036",
              "dataMessageGUID": "7077cb45-79bd-43ba-95de-78fc65024a8d",
              "state": "0",
              "messageDate": "2026-02-25 09:41:40",
              "rawData": "0%7c0%7c0%7c0%7c0%7c0%7c0%7c0%7c0%7c0%7c0%7c0%7c0%7c0",
              "dataType": "Amps|Amps|Amps|Percentage|Amps|Amps|Amps|Percentage|Amps|Amps|Amps|Percentage|AmpHours|WattHours",
              "dataValue": "0|0|0|0|0|0|0|0|0|0|0|0|0|0",
              "plotValues": "1|2|3|4|5|6|7|8|9|10|11|12|13|14",
              "plotLabels": "Phase1Average|Phase1Max|Phase1Min|Phase1Duty|Phase2Average|Phase2Max|Phase2Min|Phase2Duty|Phase3Average|Phase3Max|Phase3Min|Phase3Duty|TotalCurrentAccumulation|WattHours",
              "batteryLevel": "100",
              "signalStrength": "100",
              "pendingChange": "True",
              "voltage": "3.14"

            }
          ],
          "gatewayMessage": {
            "date": "2026-02-25 12:09:12",
            "accountID": "78815",
            "messageType": "0",
            "gatewayName": "IoT Gateway - 1101081",
            "signalStrength": "16",
            "count": "4",
            "pendingChange": "False",
            "networkID": "140036",
            "power": "0",
            "gatewayID": "1101081",
            "batteryLevel": "100"
          }
        },
      };

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.currentL1Avg, 1);
        assert.equal(value.data.currentL1Max, 2);
        assert.equal(value.data.currentL1Min, 3);
        assert.equal(value.data.dutyL1, 4);

        assert.equal(value.data.currentL2Avg, 5);
        assert.equal(value.data.currentL2Max, 6);
        assert.equal(value.data.currentL2Min, 7);
        assert.equal(value.data.dutyL2, 8);

        assert.equal(value.data.currentL3Avg, 9);
        assert.equal(value.data.currentL3Max, 10);
        assert.equal(value.data.currentL3Min, 11);
        assert.equal(value.data.dutyL3, 12);

        assert.equal(value.data.totalCurrentAccumulation, 13);
        assert.equal(value.data.wattHours, 14);

        assert.equal(value.topic, "default");

        validateSchema(value.data, defaultSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.messageId, "7077cb45-79bd-43ba-95de-78fc65024a8d");
        assert.equal(value.data.state, 0);
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.batteryVoltage, 3.14);
        assert.equal(value.data.signalStrength, 100);
        assert.equal(value.data.pendingChange, true);

        assert.equal(value.topic, "lifecycle");

        validateSchema(value.data, lifecycleSchema, { throwError: true });
      });

      expectEmits((type, value) => {
        assert.equal(type, "sample");
        assert.isNotNull(value);
        assert.typeOf(value.data, "object");

        assert.equal(value.data.accountId, "78815");
        assert.equal(value.data.batteryLevel, 100);
        assert.equal(value.data.count, 4);
        assert.equal(value.data.gatewayId, "1101081");
        assert.equal(value.data.gatewayName, "IoT Gateway - 1101081");
        assert.equal(value.data.networkId, "140036");
        assert.equal(value.data.pendingChange, false);
        assert.equal(value.data.power, 0);
        assert.equal(value.data.signalStrength, 16);

        assert.equal(value.topic, "gateway");

        validateSchema(value.data, gatewaySchema, { throwError: true });
      });

      consume(data);
    });
  });
});
