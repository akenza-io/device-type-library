import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Monnit Sensor Uplink", () => {
  let defaultSchema = null;
  let consume = null;
  let lifecycleSchema = null;
  let gatewaySchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    defaultSchema = loadSchema(`${import.meta.dirname}/default.schema.json`);
    lifecycleSchema = loadSchema(`${import.meta.dirname}/lifecycle.schema.json`);
    gatewaySchema = loadSchema(`${import.meta.dirname}/gateway.schema.json`);
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

      expectSample("default", defaultSchema, (data) => {
        assert.equal(data.currentL1Avg, 1);
        assert.equal(data.currentL1Max, 2);
        assert.equal(data.currentL1Min, 3);
        assert.equal(data.dutyL1, 4);

        assert.equal(data.currentL2Avg, 5);
        assert.equal(data.currentL2Max, 6);
        assert.equal(data.currentL2Min, 7);
        assert.equal(data.dutyL2, 8);

        assert.equal(data.currentL3Avg, 9);
        assert.equal(data.currentL3Max, 10);
        assert.equal(data.currentL3Min, 11);
        assert.equal(data.dutyL3, 12);

        assert.equal(data.totalCurrentAccumulation, 13);
        assert.equal(data.wattHours, 14);
        assert.equal(data.kiloWattHours, 0.014);
      });

      expectSample("lifecycle", lifecycleSchema, (data) => {
        assert.equal(data.messageId, "7077cb45-79bd-43ba-95de-78fc65024a8d");
        assert.equal(data.state, 0);
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.batteryVoltage, 3.14);
        assert.equal(data.signalStrength, 100);
        assert.equal(data.pendingChange, true);
      });

      expectSample("gateway", gatewaySchema, (data) => {
        assert.equal(data.accountId, "78815");
        assert.equal(data.batteryLevel, 100);
        assert.equal(data.count, 4);
        assert.equal(data.gatewayId, "1101081");
        assert.equal(data.gatewayName, "IoT Gateway - 1101081");
        assert.equal(data.networkId, "140036");
        assert.equal(data.pendingChange, false);
        assert.equal(data.power, 0);
        assert.equal(data.signalStrength, 16);
      });

      consume(data);
    });
  });
});
