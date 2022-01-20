function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  let topic = "default";

  if (payload !== "") {
    for (let pointer = 0; pointer < bits.length; ) {
      const channel = Bits.bitsToUnsigned(bits.substr(pointer, 8));
      const data = {};
      pointer += 16;

      switch (channel) {
        case 1:
          // Recalibrate Response
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 1) {
            data.recalibrateResponse = "SUCCESSFUL";
          } else {
            data.recalibrateResponse = "FAILED";
          }
          topic = "recalibrate_response";
          break;
        case 2:
          // Temperature
          data.temperature = Bits.bitsToSigned(bits.substr(pointer, 16)) * 0.1;
          pointer += 8;
          topic = "temperature";
          break;
        case 3:
          // Battery
          data.voltage = Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.01;
          pointer += 8;
          topic = "battery";
          break;
        case 5:
          // PNI Internal*
          topic = "contact_pni";
          break;
        case 6:
          // PNI Internal*
          data.hex = payload;
          topic = "contact_pni";
          break;
        case 21:
          // Parking Status
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 1) {
            data.occupancy = 1;
          } else {
            data.occupancy = 0;
          }
          topic = "occupancy";
          break;
        case 28:
          // Deactivate Response
          data.deactivate = "done";
          break;
        case 33:
          // Vehicle Count
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 128) {
            data.reboot = "RECALIBRATION";
            topic = "reboot";
          } else {
            data.vehicleCount = Bits.bitsToUnsigned(bits.substr(pointer, 8));
            topic = "vehicle_count";
          }
          break;
        case 55:
          // Keep-Alive
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) === 1) {
            data.occupancy = 1;
          } else {
            data.occupancy = 0;
          }
          topic = "occupancy";
          break;
        case 63:
          // Reboot Response
          data.reboot = "DONE";
          topic = "reboot";
          break;
        default:
        // Should not be needed
      }
      pointer += 8;
      emit("sample", { data, topic });
    }
  } else {
    emit("sample", { data: { startup: "startup" }, topic: "startup" });
  }
}
