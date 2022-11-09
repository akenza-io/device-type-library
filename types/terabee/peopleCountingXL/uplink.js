function consume(event) {
  const { data } = event;
  const sample = {};

  // LoRa
  if (data.payloadHex !== undefined) {
    const payload = event.data.payloadHex;
    const bits = Bits.hexToBits(payload);
    const lifecycle = {};

    sample.fw = Bits.bitsToUnsigned(bits.substr(0, 32));
    sample.bw = Bits.bitsToUnsigned(bits.substr(32, 32));
    // 4 Reserved
    lifecycle.wifiApEnabled = !!Number(bits.substr(68, 1));
    lifecycle.multiDevIssue = !!Number(bits.substr(69, 1));
    lifecycle.tpcStuck = !!Number(bits.substr(70, 1));
    lifecycle.tpcStopped = !!Number(bits.substr(71, 1));

    emit("sample", { data: sample, topic: "default" });
    emit("sample", { data: lifecycle, topic: "lifecycle" });

    // HTTP
  } else {
    sample.fw = data.count_in;
    sample.bw = data.count_out;
    emit("sample", { data: sample, topic: "default" });
  }
}
