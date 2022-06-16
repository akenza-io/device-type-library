function consume(event) {
  const fields = event.data.Records.slice(-1)[0].Fields[0];

  const data = {};
  data.latitude = fields.Lat;
  data.longitude = fields.Long;
  data.altitude = fields.Alt;

  data.heading = fields.Head;
  data.pdop = fields.PDOP;
  data.gpsAccuracy = fields.PosAcc;
  data.speed = fields.Spd;
  data.speedAccuracy = fields.SpdAcc;

  // data.gpsStatus = fields.GpsStat;

  emit("sample", { data, topic: "default" });
}
