function consume(event) {
  const payload = event.data.payloadHex; // 0500647ad001020200030202
  const inputBytes = convertToByteArray(payload);
  const input = {};
  input.bytes = inputBytes;
  const result = exports.decodeUplink(input);

  console.log(result);

  /*
  emit("sample", {
    data: { batteryPercent },
    topic: "lifecycle",
  });
  emit("sample", { data, topic: "default" });
  */
}

consume({
  data: {
    port: 1,
    payloadHex: "0500647ad001020200030202",
  },
});
