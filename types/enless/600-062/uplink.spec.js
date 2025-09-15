const assert = require("chai").assert;
const consume = require("../src/decoder").consume;

describe("Enless 600-062 Uplink", function () {
  it("should decode periodic message correctly", function () {
    const data = {
      data: {
        payloadHex: "0144bf22870c00d7000001dd000000000001000000000000000000000010"
      }
    };

    let emitted = [];
    const emit = (topic, value) => {
      emitted.push({ topic, value });
    };

    consume(data, emit);

    // Lifecycle
    const lifecycle = emitted.find(e => e.topic === "lifecycle").value.data;
    assert.equal(lifecycle.batteryLevel, "100%");

    // Default
    const decoded = emitted.find(e => e.topic === "default").value.data;
    assert.equal(decoded.id, 83135);
    assert.equal(decoded.type, 34);
    assert.equal(decoded.seq_counter, 135);
    assert.equal(decoded.fw_version, 12);

    // Temperature (0x00d7 → 215 / 10 = 21.5°C)
    assert.closeTo(decoded.temperature, 21.5, 0.1);

    // Humidity (0x01dd → 477 / 10 = 47.7 %)
    assert.closeTo(decoded.humidity, 47.7, 0.1);

    // PIR count
    assert.equal(decoded.pir_count, 1);

    // Luminosity
    assert.equal(decoded.luminosity, "0");

    // Alarm status (all OK → false)
    assert.isFalse(decoded.alarm_status.temperatureHigh);
    assert.isFalse(decoded.alarm_status.temperatureLow);
    assert.isFalse(decoded.alarm_status.humidityHigh);
    assert.isFalse(decoded.alarm_status.humidityLow);
    assert.isFalse(decoded.alarm_status.motionGuard);

    // Status
    assert.equal(decoded.msg_type, "normal");
    assert.isFalse(decoded.rbe);
    assert.isTrue(decoded.movement_detected);
  });
});
