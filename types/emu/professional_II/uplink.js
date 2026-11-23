function crc8_encode(data) {
  var xorOut = 0x0000;
  var table = [
    0x00, 0x07, 0x0E, 0x09, 0x1C, 0x1B,
    0x12, 0x15, 0x38, 0x3F, 0x36, 0x31,
    0x24, 0x23, 0x2A, 0x2D, 0x70, 0x77,
    0x7E, 0x79, 0x6C, 0x6B, 0x62, 0x65,
    0x48, 0x4F, 0x46, 0x41, 0x54, 0x53,
    0x5A, 0x5D, 0xE0, 0xE7, 0xEE, 0xE9,
    0xFC, 0xFB, 0xF2, 0xF5, 0xD8, 0xDF,
    0xD6, 0xD1, 0xC4, 0xC3, 0xCA, 0xCD,
    0x90, 0x97, 0x9E, 0x99, 0x8C, 0x8B,
    0x82, 0x85, 0xA8, 0xAF, 0xA6, 0xA1,
    0xB4, 0xB3, 0xBA, 0xBD, 0xC7, 0xC0,
    0xC9, 0xCE, 0xDB, 0xDC, 0xD5, 0xD2,
    0xFF, 0xF8, 0xF1, 0xF6, 0xE3, 0xE4,
    0xED, 0xEA, 0xB7, 0xB0, 0xB9, 0xBE,
    0xAB, 0xAC, 0xA5, 0xA2, 0x8F, 0x88,
    0x81, 0x86, 0x93, 0x94, 0x9D, 0x9A,
    0x27, 0x20, 0x29, 0x2E, 0x3B, 0x3C,
    0x35, 0x32, 0x1F, 0x18, 0x11, 0x16,
    0x03, 0x04, 0x0D, 0x0A, 0x57, 0x50,
    0x59, 0x5E, 0x4B, 0x4C, 0x45, 0x42,
    0x6F, 0x68, 0x61, 0x66, 0x73, 0x74,
    0x7D, 0x7A, 0x89, 0x8E, 0x87, 0x80,
    0x95, 0x92, 0x9B, 0x9C, 0xB1, 0xB6,
    0xBF, 0xB8, 0xAD, 0xAA, 0xA3, 0xA4,
    0xF9, 0xFE, 0xF7, 0xF0, 0xE5, 0xE2,
    0xEB, 0xEC, 0xC1, 0xC6, 0xCF, 0xC8,
    0xDD, 0xDA, 0xD3, 0xD4, 0x69, 0x6E,
    0x67, 0x60, 0x75, 0x72, 0x7B, 0x7C,
    0x51, 0x56, 0x5F, 0x58, 0x4D, 0x4A,
    0x43, 0x44, 0x19, 0x1E, 0x17, 0x10,
    0x05, 0x02, 0x0B, 0x0C, 0x21, 0x26,
    0x2F, 0x28, 0x3D, 0x3A, 0x33, 0x34,
    0x4E, 0x49, 0x40, 0x47, 0x52, 0x55,
    0x5C, 0x5B, 0x76, 0x71, 0x78, 0x7F,
    0x6A, 0x6D, 0x64, 0x63, 0x3E, 0x39,
    0x30, 0x37, 0x22, 0x25, 0x2C, 0x2B,
    0x06, 0x01, 0x08, 0x0F, 0x1A, 0x1D,
    0x14, 0x13, 0xAE, 0xA9, 0xA0, 0xA7,
    0xB2, 0xB5, 0xBC, 0xBB, 0x96, 0x91,
    0x98, 0x9F, 0x8A, 0x8D, 0x84, 0x83,
    0xDE, 0xD9, 0xD0, 0xD7, 0xC2, 0xC5,
    0xCC, 0xCB, 0xE6, 0xE1, 0xE8, 0xEF,
    0xFA, 0xFD, 0xF4, 0xF3
  ];
  var crc = 0x0000;
  for (var j = 0; j < data.length; j++) {
    crc = table[crc ^ data[j]];
  }
  return (crc ^ xorOut) & 0xFFFF;
}

function getUint8(data) {
  var value = data >>> 0;
  return value;
}

function flip(n) {
  var x = [];
  n = Number(n);
  //will work only for positive numbers
  var single = n.toString(2).split("");
  for (var i = 0; i < single.length; i++) {
    x.push(single[i] == 1 ? 0 : 1);
  }
  var tmp = x.join("");
  var y = (parseInt(tmp, 2) + 1) * -1;
  return y;
}

function getInt8(data) {
  if (data === 0) { return 0; }
  if (data >> 7 == 1) {
    return flip(data);
  }
  var value = data >>> 0;
  return value;
}

function getInt16(data) {
  let value = (data[1] << 8 | data[0]);
  return value;
}

function getUint16(data) {
  let value = (data[1] << 8 | data[0]) >>> 0;
  return value;
}

function getInt32(data) {
  let value = (data[3] << 24 | data[2] << 16 | data[1] << 8 | data[0]);
  return value;
}

function getUint32(data) {
  let value = (data[3] << 24 | data[2] << 16 | data[1] << 8 | data[0]) >>> 0;
  return value;
}

function getInt64(data) {
  //JS can't handle bitwise operation with more than 32bit !
  //so this won't work 
  //if Chirpstack will use another javascript engine we could use typearray's
  var value = Number((data[7] << 56 | data[6] << 48 | data[5] << 40 | data[4] << 32 | data[3] << 24 | data[2] << 16 | data[1] << 8 | data[0]));
  return value;
}

function getUint64(data) {
  //JS can't handle bitwise operation with more than 32bit !
  //so this won't work 
  //if Chirpstack will use another javascript engine we could use typearray's
  let value = Number((data[7] << 56 | data[6] << 48 | data[5] << 40 | data[4] << 32 | data[3] << 24 | data[2] << 16 | data[1] << 8 | data[0]) >>> 0);
  return value;
}

function getBCD(data) {
  var bcd = "";
  for (var i = 0; i < data.length; i++) {
    bcd = bcd + "" + data[i];
  }
  return bcd;
}

function getASCII(data) {
  var ascii = "";
  for (var i = 0; i < data.length; i++) {
    let entry = getUint8(data[i]);
    if (entry != 0x00) {
      ascii = ascii + String.fromCharCode(entry.toString());
    }
  }
  return ascii;
}

function parsePayload(data) {
  var dataTypes = [];
  //be sure to fill the complete array
  //if we receive an invalid datatype we skip the rest of the data 
  for (i = 0; i < 256; i++) {
    dataTypes[i] = { 'len': 255, 'description': 'invalid data-type' };
  }
  //the "order" is assigned according to the entry
  dataTypes[0x00] = { 'len': 4, 'description': 'data-logger-index', 'dataType': 'Uint32' };
  dataTypes[0x01] = { 'len': 4, 'description': 'timestamp', 'dataType': 'Uint32', 'unit': 'seconds' };
  dataTypes[0x02] = { 'len': 4, 'description': 'timestamp-previous', 'dataType': 'Uint32', 'unit': 'seconds' };
  dataTypes[0x03] = { 'len': 4, 'description': 'Active Energy Import T1', 'dataType': 'Uint32', 'unit': 'Wh', 'cfgdescription': 3, "cfgunit": 1, 'cfgtariff': 1 };
  dataTypes[0x04] = { 'len': 4, 'description': 'Active Energy Import T2', 'dataType': 'Uint32', 'unit': 'Wh', 'cfgdescription': 3, "cfgunit": 1, 'cfgtariff': 2 };
  dataTypes[0x05] = { 'len': 4, 'description': 'Active Energy Export T1', 'dataType': 'Uint32', 'unit': 'Wh', 'cfgdescription': 5, "cfgunit": 1, 'cfgtariff': 1 };
  dataTypes[0x06] = { 'len': 4, 'description': 'Active Energy Export T2', 'dataType': 'Uint32', 'unit': 'Wh', 'cfgdescription': 5, "cfgunit": 1, 'cfgtariff': 2 };
  dataTypes[0x07] = { 'len': 4, 'description': 'Reactive Energy Import T1', 'dataType': 'Uint32', 'unit': 'varh', 'cfgdescription': 10, "cfgunit": 5, 'cfgtariff': 1 };
  dataTypes[0x08] = { 'len': 4, 'description': 'Reactive Energy Import T2', 'dataType': 'Uint32', 'unit': 'varh', 'cfgdescription': 10, "cfgunit": 5, 'cfgtariff': 2 };
  dataTypes[0x09] = { 'len': 4, 'description': 'Reactive Energy Export T1', 'dataType': 'Uint32', 'unit': 'varh', 'cfgdescription': 13, "cfgunit": 5, 'cfgtariff': 1 };
  dataTypes[0x0A] = { 'len': 4, 'description': 'Reactive Energy Export T2', 'dataType': 'Uint32', 'unit': 'varh', 'cfgdescription': 13, "cfgunit": 5, 'cfgtariff': 2 };
  dataTypes[0x0B] = { 'len': 4, 'description': 'Active Power L123', 'dataType': 'Int32', 'unit': 'W', 'cfgdescription': 25, "cfgunit": 13 };
  dataTypes[0x0C] = { 'len': 4, 'description': 'Active Power L1', 'dataType': 'Int32', 'unit': 'W', 'cfgdescription': 25, "cfgunit": 13, 'cfgphase': 1 };
  dataTypes[0x0D] = { 'len': 4, 'description': 'Active Power L2', 'dataType': 'Int32', 'unit': 'W', 'cfgdescription': 25, "cfgunit": 13, 'cfgphase': 2 };
  dataTypes[0x0E] = { 'len': 4, 'description': 'Active Power L3', 'dataType': 'Int32', 'unit': 'W', 'cfgdescription': 25, "cfgunit": 13, 'cfgphase': 3 };
  dataTypes[0x0F] = { 'len': 4, 'description': 'Current L123', 'dataType': 'Int32', 'unit': 'mA', 'cfgdescription': 31, "cfgunit": 28 };
  dataTypes[0x10] = { 'len': 4, 'description': 'Current L1', 'dataType': 'Int32', 'unit': 'mA', 'cfgdescription': 31, "cfgunit": 28, 'cfgphase': 1 };
  dataTypes[0x11] = { 'len': 4, 'description': 'Current L2', 'dataType': 'Int32', 'unit': 'mA', 'cfgdescription': 31, "cfgunit": 28, 'cfgphase': 2 };
  dataTypes[0x12] = { 'len': 4, 'description': 'Current L3', 'dataType': 'Int32', 'unit': 'mA', 'cfgdescription': 31, "cfgunit": 28, 'cfgphase': 3 };
  dataTypes[0x13] = { 'len': 4, 'description': 'Current N', 'dataType': 'Int32', 'unit': 'mA', 'cfgdescription': 31, "cfgunit": 28, 'cfgphase': 4 };
  dataTypes[0x14] = { 'len': 4, 'description': 'Voltage L1-N', 'dataType': 'Int32', 'unit': 'V/10', 'unit_calculated': 'V', 'factor': 0.1, 'fixed': 1, 'cfgdescription': 30, "cfgunit": 26, 'cfgphase': 1 };
  dataTypes[0x15] = { 'len': 4, 'description': 'Voltage L2-N', 'dataType': 'Int32', 'unit': 'V/10', 'unit_calculated': 'V', 'factor': 0.1, 'fixed': 1, 'cfgdescription': 30, "cfgunit": 26, 'cfgphase': 2 };
  dataTypes[0x16] = { 'len': 4, 'description': 'Voltage L3-N', 'dataType': 'Int32', 'unit': 'V/10', 'unit_calculated': 'V', 'factor': 0.1, 'fixed': 1, 'cfgdescription': 30, "cfgunit": 26, 'cfgphase': 3 };
  dataTypes[0x17] = { 'len': 1, 'description': 'Powerfactor L1', 'dataType': 'Int8', 'unit': 'Cos', 'factor': 0.01, 'fixed': 2, 'cfgdescription': 32, "cfgunit": 31, 'cfgphase': 1 };
  dataTypes[0x18] = { 'len': 1, 'description': 'Powerfactor L2', 'dataType': 'Int8', 'unit': 'Cos', 'factor': 0.01, 'fixed': 2, 'cfgdescription': 32, "cfgunit": 31, 'cfgphase': 2 };
  dataTypes[0x19] = { 'len': 1, 'description': 'Powerfactor L3', 'dataType': 'Int8', 'unit': 'Cos', 'factor': 0.01, 'fixed': 2, 'cfgdescription': 32, "cfgunit": 31, 'cfgphase': 3 };
  dataTypes[0x1A] = { 'len': 2, 'description': 'Frequency', 'dataType': 'Int16', 'unit': 'Hz', 'factor': 0.1, 'fixed': 1, 'cfgdescription': 33, "cfgunit": 32 };
  dataTypes[0x1B] = { 'len': 4, 'description': 'Active Power average', 'dataType': 'Int32', 'unit': 'W', "cfgunit": 13, };
  dataTypes[0x1C] = { 'len': 4, 'description': 'Active Energy Import T1', 'dataType': 'Uint32', 'unit': 'kWh', 'cfgdescription': 3, "cfgunit": 2, 'cfgtariff': 1 };
  dataTypes[0x1D] = { 'len': 4, 'description': 'Active Energy Import T2', 'dataType': 'Uint32', 'unit': 'kWh', 'cfgdescription': 3, "cfgunit": 2, 'cfgtariff': 2 };
  dataTypes[0x1E] = { 'len': 4, 'description': 'Active Energy Export T1', 'dataType': 'Uint32', 'unit': 'kWh', 'cfgdescription': 5, "cfgunit": 2, 'cfgtariff': 1 };
  dataTypes[0x1F] = { 'len': 4, 'description': 'Active Energy Export T2', 'dataType': 'Uint32', 'unit': 'kWh', 'cfgdescription': 5, "cfgunit": 2, 'cfgtariff': 2 };
  dataTypes[0x20] = { 'len': 4, 'description': 'Reactive Energy Import T1 kvarh', 'dataType': 'Uint32', 'unit': 'kvarh', 'cfgdescription': 10, "cfgunit": 6, 'cfgtariff': 1 };
  dataTypes[0x21] = { 'len': 4, 'description': 'Reactive Energy Import T2 kvarh', 'dataType': 'Uint32', 'unit': 'kvarh', 'cfgdescription': 10, "cfgunit": 6, 'cfgtariff': 2 };
  dataTypes[0x22] = { 'len': 4, 'description': 'Reactive Energy Export T1 kvarh', 'dataType': 'Uint32', 'unit': 'kvarh', 'cfgdescription': 13, "cfgunit": 6, 'cfgtariff': 1 };
  dataTypes[0x23] = { 'len': 4, 'description': 'Reactive Energy Export T2 kvarh', 'dataType': 'Uint32', 'unit': 'kvarh', 'cfgdescription': 13, "cfgunit": 6, 'cfgtariff': 2 };
  dataTypes[0x24] = { 'len': 8, 'description': 'Active Energy Import T1 64bit', 'dataType': 'uInt64', 'unit': 'Wh', 'cfgdescription': 3, "cfgunit": 1, 'cfgtariff': 1 };
  dataTypes[0x25] = { 'len': 8, 'description': 'Active Energy Import T2 64bit', 'dataType': 'uInt64', 'unit': 'Wh', 'cfgdescription': 3, "cfgunit": 1, 'cfgtariff': 2 };
  dataTypes[0x26] = { 'len': 8, 'description': 'Active Energy Export T1 64bit', 'dataType': 'uInt64', 'unit': 'Wh', 'cfgdescription': 5, "cfgunit": 1, 'cfgtariff': 1 };
  dataTypes[0x27] = { 'len': 8, 'description': 'Active Energy Export T2 64bit', 'dataType': 'uInt64', 'unit': 'Wh', 'cfgdescription': 5, "cfgunit": 1, 'cfgtariff': 2 };
  dataTypes[0x28] = { 'len': 8, 'description': 'Reactive Energy Import T1 64bit', 'dataType': 'uInt64', 'unit': 'varh', 'cfgdescription': 10, "cfgunit": 5, 'cfgtariff': 1 };
  dataTypes[0x29] = { 'len': 8, 'description': 'Reactive Energy Import T2 64bit', 'dataType': 'uInt64', 'unit': 'varh', 'cfgdescription': 10, "cfgunit": 5, 'cfgtariff': 2 };
  dataTypes[0x2A] = { 'len': 8, 'description': 'Reactive Energy Export T1 64bit', 'dataType': 'uInt64', 'unit': 'varh', 'cfgdescription': 13, "cfgunit": 5, 'cfgtariff': 1 };
  dataTypes[0x2B] = { 'len': 8, 'description': 'Reactive Energy Export T2 64bit', 'dataType': 'uInt64', 'unit': 'varh', 'cfgdescription': 13, "cfgunit": 5, 'cfgtariff': 2 };
  dataTypes[0xF0] = { 'len': 1, 'description': 'errorcode', 'dataType': 'ErrorCode' };
  dataTypes[0xF1] = { 'len': 4, 'description': 'serial-number', 'dataType': 'MeterSerial' };
  dataTypes[0xF2] = { 'len': 4, 'description': 'factor-number', 'dataType': 'MeterSerial' };
  dataTypes[0xF3] = { 'len': 2, 'description': 'current-transformer primary', 'dataType': 'Uint16', "cfgunit": 72, };
  dataTypes[0xF4] = { 'len': 2, 'description': 'current-transformer secondary', 'dataType': 'Uint16', "cfgunit": 72, };
  dataTypes[0xF5] = { 'len': 2, 'description': 'voltage-transformer primary', 'dataType': 'Uint16', "cfgunit": 72, };
  dataTypes[0xF6] = { 'len': 2, 'description': 'voltage-transformer secondary', 'dataType': 'Uint16', "cfgunit": 72, };
  dataTypes[0xF7] = { 'len': 1, 'description': 'meter-typ', 'dataType': 'Uint8' };
  dataTypes[0xF8] = { 'len': 4, 'description': 'MID year', 'dataType': 'BCD', };
  dataTypes[0xF9] = { 'len': 4, 'description': 'factory year', 'dataType': 'BCD', };
  dataTypes[0xFA] = { 'len': 4, 'description': 'firmware version', 'dataType': 'ASCII' };
  dataTypes[0xFB] = { 'len': 4, 'description': 'mid-Version', 'dataType': 'ASCII' };
  dataTypes[0xFC] = { 'len': 4, 'description': 'manufacturer', 'dataType': 'ASCII' };
  dataTypes[0xFD] = { 'len': 4, 'description': 'hw-index', 'dataType': 'ASCII' };
  dataTypes[0xFE] = { 'len': 4, 'description': 'systemtime', 'dataType': 'Uint32' };
  var obj = {};
  var i = 4; //the first 4 bytes is allways the timestamp
  //the last byte is the crc-code so ignore this one
  while (i < (data.length - 1)) {
    //extract signature byte 
    let indexOfDataType = data[i];
    let dataType = dataTypes[indexOfDataType];
    i++;
    //also save the sort-order value  
    dataType.order = indexOfDataType;
    switch (dataType.dataType) {
      case 'Int8':
        dataType.value = Number(getInt8([data[i++]]));
        break;
      case 'Uint8':
        dataType.value = Number(getUint8([data[i++]]));
        break;
      case 'Int16':
        dataType.value = Number(getInt16([data[i++], data[i++]]));
        break;
      case 'Uint16':
        dataType.value = Number(getUint16([data[i++], data[i++]]));
        break;
      case 'Uint32':
        dataType.value = Number(getUint32([data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'Int32':
        dataType.value = Number(getInt32([data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'uInt64':
        dataType.value = Number(getUint64([data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'Int64':
        dataType.value = Number(getInt64([data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++], data[i++]]));
        break;
      case 'MeterSerial':
        dataType.value = ('0' + Number(getUint8([data[i++]])).toString(16)).slice(-2);
        dataType.value = ('0' + Number(getUint8([data[i++]])).toString(16)).slice(-2) + dataType.value;
        dataType.value = ('0' + Number(getUint8([data[i++]])).toString(16)).slice(-2) + dataType.value;
        dataType.value = ('0' + Number(getUint8([data[i++]])).toString(16)).slice(-2) + dataType.value;
        break;
      case 'BCD':
        dataType.value = getBCD([data[i++], data[i++], data[i++], data[i++]]);
        break;
      case 'ASCII':
        dataType.value = getASCII([data[i++], data[i++], data[i++], data[i++]]);
        break;
      case 'ErrorCode':
        dataType.value = Number(getUint8([data[i++]]));
        //also encode the error
        dataType.timeChanged = dataType.value & 0x01 ? true : false;
        dataType.ctRatioChange = dataType.value & 0x02 ? true : false;
        dataType.vtRatioChange = dataType.value & 0x04 ? true : false;
        dataType.impulseWidthChange = dataType.value & 0x08 ? true : false;
        dataType.impulseRatioChange = dataType.value & 0x10 ? true : false;
        dataType.powerFail = dataType.value & 0x20 ? true : false;
        dataType.logbookFull = dataType.value & 0x80 ? true : false;
        break;
      default:
        break;
    }
    //if we have a factor apply it but keep the old value
    if (dataType.factor && !isNaN(dataType.factor)) {
      let fixed = 0;
      if (dataType.fixed && !isNaN(dataType.fixed)) {
        fixed = dataType.fixed;
      }
      //save the value which was sent by the meter (perhaps needed later)
      dataType.value_raw = dataType.value;
      //calculate the new value using the factor
      dataType.value = Number((dataType.value * dataType.factor).toFixed(fixed));
    }
    obj[dataType.description] = dataType;
    //remove all unused infos like dataType, description, len
    delete dataType.len;
    delete dataType.description;
    delete dataType.dataType;
    delete dataType.factor;
    delete dataType.fixed;
  }
  return obj;
}

function decodeUplink(data) {
  //uplink with only 2 bytes is only status update, ignore it 
  if (data.length <= 2) {
    return {
      data: 'not enough data to process'
    };
  }
  var obj = {};
  //check CRC-8 which resides at the end
  let crc8Received = data[data.length - 1];
  let dataToCheck = [];
  for (var i = 0; i < data.length - 1; i++) {
    dataToCheck.push(data[i]);
  }
  if (crc8_encode(dataToCheck).toString(16) === crc8Received.toString(16)) {
    //crc-8 seems ok, 
  } else {
    obj.warnings = ['crc-8 wrong'];
    //perhaps decide to stop further processing if crc-8 is wrong
  }
  //first 4 bytes are allways the timestamp, this is the timestamp from the datalogger
  var timeStamp = getUint32(data);
  obj.data = parsePayload(data);
  //for TTN we strip unused information
  for (var property in obj.data) {
    delete obj.data[property].cfgdescription;
    delete obj.data[property].cfgtariff;
    delete obj.data[property].cfgunit;
    delete obj.data[property].cfgorder;
    delete obj.data[property].order;
  }
  obj.data.timeStamp = timeStamp * 1000;
  return obj;
}

function toCamelCase(str) {
  return str
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word, i) => {
      const lower = word.toLowerCase();
      return i === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
    })
    .join("");
}

function isEmpty(obj) {
  if (obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
}

function calculateIncrement(lastValue, currentValue) {
  // Check if current value exists
  if (currentValue === undefined || Number.isNaN(currentValue)) {
    return 0;
  }

  // Init state && Check for the case the counter reseted
  if (lastValue === undefined || lastValue > currentValue) {
    lastValue = currentValue;
  }
  // Calculate increment
  return currentValue - lastValue;
}

function consume(event) {
  const payload = event.data.payloadHex;
  const state = event.state || {};
  const bytes = Hex.hexToBytes(payload);
  const decoded = decodeUplink(bytes);
  const data = {};
  const warnings = [];
  let topic = "default";

  const system = decoded.data.errorcode;
  delete decoded.data.errorcode;

  let timestamp = decoded.data.timeStamp;
  delete decoded.data.timeStamp;

  Object.keys(decoded.data).forEach((key) => {
    if (decoded.data[key].value !== undefined && decoded.data[key].value !== null) {
      let cleanKey = toCamelCase(key);
      data[cleanKey] = decoded.data[key].value;

      if (cleanKey.search("activeEnergyImport") !== -1 || cleanKey.search("activeEnergyExport") !== -1) {
        // Active Energy Import always kWh
        if (decoded.data[key].unit == "Wh") {
          decoded.data[key].unit = "kWh";
          data[cleanKey] /= 1000;
        }

        // Give out consumption
        data[cleanKey + "Consumption"] = calculateIncrement(
          state[cleanKey],
          data[cleanKey],
        );
        state[cleanKey] = data[cleanKey];
      }

    } else {
      warnings.push(key);
    }
  });

  if (!isEmpty(system)) {
    emit("sample", { data: system, topic: "system" });
  }

  if (warnings.length > 1) {
    emit("sample", { data: { "badTransformation": warnings }, topic: "warning" });
  }

  emit("sample", { data, topic, timestamp: new Date(timestamp).toISOString() });
  emit("state", state);
}
