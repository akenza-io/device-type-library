function consume(event) {
  const payload = event.data.payloadHex;
  const bits = Bits.hexToBits(payload);
  const data = {};
  const door = {};
  const lifecycle = {};
  const system = {};

  // Header Reserved 0-40
  let pointer = 40;

  while (pointer < bits.length) {
    const dataType = Bits.bitsToUnsigned(bits.substr(pointer, 8));

    switch (dataType) {
      case 0x01:
        system.hwVersion = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        system.swVersion = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        pointer += 8;
        break;
      case 0x03:
        lifecycle.batteryLevel = Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        );
        pointer += 8;
        break;
      case 0x08:
        data.open = !!Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        pointer += 8;
        break;
      case 0x22:
        system.mode = Bits.bitsToUnsigned(bits.substr((pointer += 8), 8));
        pointer += 8;
        break;
      case 0x23:
        system.countingHours = `${Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        )}:${Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        )}-${Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        )}:${Bits.bitsToUnsigned(bits.substr((pointer += 8), 8))}`;
        pointer += 8;
        break;
      case 0x24:
        system.countingInterval = Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 16),
        );
        pointer += 16;
        break;
      case 0x25: {
        const lifecycleInterval = Bits.bitsToUnsigned(
          bits.substr((pointer += 8), 8),
        );
        if (lifecycleInterval === 0) {
          system.lifecycleInterval = 24;
        } else if (lifecycleInterval === 1) {
          system.lifecycleInterval = 12;
        } else {
          system.lifecycleInterval = 8;
        }
        pointer += 8;
        break;
      }
      case 0x26:
        door.nrOpenings = Bits.bitsToUnsigned(bits.substr((pointer += 8), 16));
        door.nrClosings = Bits.bitsToUnsigned(bits.substr((pointer += 16), 16));
        door.absOpenings = Bits.bitsToUnsigned(
          bits.substr((pointer += 16), 32),
        );
        door.absClosings = Bits.bitsToUnsigned(
          bits.substr((pointer += 32), 32),
        );
        pointer += 32;
        break;
      case 0x84:
        system.instaled = !!Bits.bitsToUnsigned(bits.substr(48, 8));
        pointer += 8;
        break;
      default:
        pointer = bits.length;
        break;
    }
  }

  if (Object.keys(data).length > 0) {
    emit("sample", { data, topic: "default" });
  }
  if (Object.keys(door).length > 0) {
    emit("sample", { data: door, topic: "door" });
  }
  if (Object.keys(lifecycle).length > 0) {
    emit("sample", { data: lifecycle, topic: "lifecycle" });
  }
  if (Object.keys(system).length > 0) {
    emit("sample", { data: system, topic: "system" });
  }
}
