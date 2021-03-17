var Bits = require('bits');

function consume(event) {
  var payload = event.data.payload_hex;
  var bits = Bits.hexToBits(payload);
  var topic = "default";

  if (payload !== '') {

    for (var pointer = 0; pointer < bits.length;) {
      var channel = Bits.bitsToUnsigned(bits.substr(pointer, 8));
      var data = {};
      pointer += 16;

      switch (channel) {
        case 1:
          // Recalibrate Response
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) == 1) {
            data.recalibrateResponse = 'successful';
          } else {
            data.recalibrateResponse = 'failed';
          }
          topic = "recalibrateResponse";
          break;
        case 2:
          // Temperature
          data.temperature = (Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.1);
          pointer += 8;
          topic = "temperature";
          break;
        case 3:
          // Battery
          data.battery = (Bits.bitsToUnsigned(bits.substr(pointer, 16)) * 0.01);
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
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) == 1) {
            data.occupancy = 1;
          } else {
            data.occupancy = 0;
          }
          topic = "occupancy";
          break;
        case 28:
          // Deactivate Response
          data.deactivate = 'done';
          break;
        case 33:
          // Vehicle Count
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) == 128) {
            data.reboot = "Sensor reboot or recalibration";
            topic = "reboot";
          } else {
            data.vehicleCount = Bits.bitsToUnsigned(bits.substr(pointer, 8));
            topic = "vehicleCount";
          }
          break;
        case 55:
          // Keep-Alive
          if (Bits.bitsToUnsigned(bits.substr(pointer, 8)) == 1) {
            data.occupancy = 1;
          } else {
            data.occupancy = 0;
          }
          topic = "occupancy";
          break;
        case 63:
          // Reboot Response
          data.reboot = 'done';
          topic = "reboot";
          break;
        default:
        // Should not be needed
      }
      pointer += 8;
      emit('sample', { data: data, topic: topic });
    }
  } else {
    emit('sample', { data: { 'startup': 'startup' }, topic: 'startup' });
  }
}