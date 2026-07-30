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
  const { data } = event;
  const sample = {};

  // LoRa
  if (data.payloadHex !== undefined) {
    const payload = event.data.payloadHex;
    const bits = Bits.hexToBits(payload);
    const lifecycle = {};

    sample.absoluteFw = Bits.bitsToUnsigned(bits.substring(0, 32));
    sample.absoluteBw = Bits.bitsToUnsigned(bits.substring(32, 64));

    // 4 Reserved
    lifecycle.wifiApEnabled = !!Number(bits.substring(68, 69));
    lifecycle.multiDevIssue = !!Number(bits.substring(69, 70));
    lifecycle.tpcStuck = !!Number(bits.substring(70, 71));
    lifecycle.tpcStopped = !!Number(bits.substring(71, 72));

    emit("sample", { data: lifecycle, topic: "lifecycle" });

    // HTTP
  } else {
    sample.absoluteFw = data.count_in;
    sample.absoluteBw = data.count_out;
  }

  const state = event.state || {};
  sample.fw = calculateIncrement(state.lastFw, sample.absoluteFw);
  sample.bw = calculateIncrement(state.lastBw, sample.absoluteBw);
  state.lastFw = sample.absoluteFw;
  state.lastBw = sample.absoluteBw;

  emit("sample", { data: sample, topic: "default" });
  emit("state", state);
}
