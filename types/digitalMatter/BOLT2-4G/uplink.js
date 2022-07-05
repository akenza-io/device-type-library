function consume(event) {
  const records = event.data.Records;

  if (records !== undefined) {
    // Search for newest entry
    let dex = 0;
    for (let i = 0, seqNo = 0; i < records.length; i++) {
      const record = records[i];
      if (seqNo < record.SeqNo) {
        dex = i;
      }
    }

    const fields = records[dex].Fields;

    // Loop over fields
    fields.forEach((field) => {
      const data = {};
      let topic = "default";
      switch (field.FType) {
        case 0:
          topic = "gps";
          data.latitude = field.Lat;
          data.longitude = field.Long;
          data.altitude = field.Alt;

          data.heading = field.Head;
          data.pdop = field.PDOP;
          data.gpsAccuracy = field.PosAcc;
          data.speed = field.Spd;
          data.speedAccuracy = field.SpdAcc;

          break;
        case 2:
          topic = "digital";
          data.digitalIn = field.DIn;
          data.digitalOut = field.DOut;
          data.devStat = field.DevStat;
          break;
        case 6:
          topic = "analog";
          data.analog = field.AnalogueData;
          break;
        default:
          break;
      }
      if (topic !== "default") {
        emit("sample", { data, topic });
      }
    });
  }
}
