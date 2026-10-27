import { assert } from "chai";
import rewire from "rewire";
import { init, loadSchema, expectSample } from "test-utils";

describe("Yosensi YO People Counter uplink", () => {
  let batteryVoltageSchema = null;
  let consume = null;
  let temperatureSchema = null;
  let humiditySchema = null;
  let leftToRightSchema = null;
  let rightToLeftSchema = null;
  let sumLeftToRightSchema = null;
  let sumRightToLeftSchema = null;
  let differenceCountSchema = null;

  before(() => {
    consume = init(rewire(`${import.meta.dirname}/uplink.js`));
    batteryVoltageSchema = loadSchema(`${import.meta.dirname}/battery_voltage.schema.json`);
    temperatureSchema = loadSchema(`${import.meta.dirname}/temperature.schema.json`);
    humiditySchema = loadSchema(`${import.meta.dirname}/humidity.schema.json`);
    leftToRightSchema = loadSchema(`${import.meta.dirname}/left_to_right.schema.json`);
    rightToLeftSchema = loadSchema(`${import.meta.dirname}/right_to_left.schema.json`);
    sumLeftToRightSchema = loadSchema(`${import.meta.dirname}/sum_left_to_right.schema.json`);
    sumRightToLeftSchema = loadSchema(`${import.meta.dirname}/sum_right_to_left.schema.json`);
    differenceCountSchema = loadSchema(`${import.meta.dirname}/difference_count.schema.json`);
  });

  describe("consume()", () => {
    it("should decode the Yosensi YO People Counter (Battery Voltage, Temperature, Humidity) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex: "026a0001080001149a0d000100f810000016",
        },
      };

      expectSample("battery_voltage", batteryVoltageSchema, (data) => {
        assert.equal(data.batteryVoltage, 5274);
      });

      expectSample("temperature", temperatureSchema, (data) => {
        assert.equal(data.temperature, 24.8);
      });

      expectSample("humidity", humiditySchema, (data) => {
        assert.equal(data.humidity, 22);
      });

      consume(data);
    });

    it("should decode the Yosensi YO People Counter (Counters, Sum of Counts, Difference between sum) payload", () => {
      const data = {
        data: {
          port: 0,
          payloadHex:
            "026b003d60001100000860001101000a6000130200000026600013030000004d60001304ffffffd9",
        },
      };

      expectSample("left_to_right", leftToRightSchema, (data) => {
        assert.equal(data.leftToRight, 8);
      });

      expectSample("right_to_left", rightToLeftSchema, (data) => {
        assert.equal(data.rightToLeft, 10);
      });

      expectSample("sum_left_to_right", sumLeftToRightSchema, (data) => {
        assert.equal(data.sumLeftToRight, 38);
      });

      expectSample("sum_right_to_left", sumRightToLeftSchema, (data) => {
        assert.equal(data.sumRightToLeft, 77);
      });

      expectSample("difference_count", differenceCountSchema, (data) => {
        assert.equal(data.differenceCount, -39);
      });

      consume(data);
    });
  });
});
