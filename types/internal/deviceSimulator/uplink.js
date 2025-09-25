function cToF(celsius) { 
 return Math.round(((celsius * 9) / 5 + 32) * 10) / 10; 
 } 

function consume(event) {
  emit("sample", { data: event.data, topic: "default" });
}
