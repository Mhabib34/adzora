const prayers = [
  { key: "imsak", name: "Imsak", time: new Date("2026-05-23T20:44:00+07:00"), iqomahTime: null },
  { key: "fajr", name: "Subuh", time: new Date("2026-05-23T20:54:00+07:00"), iqomahTime: new Date("2026-05-23T21:04:00+07:00") },
  { key: "dhuhr", name: "Dzuhur", time: new Date("2026-05-23T12:27:00+07:00"), iqomahTime: new Date("2026-05-23T12:37:00+07:00") },
  { key: "asr", name: "Ashar", time: new Date("2026-05-23T15:47:00+07:00"), iqomahTime: new Date("2026-05-23T15:57:00+07:00") },
  { key: "maghrib", name: "Maghrib", time: new Date("2026-05-23T18:34:00+07:00"), iqomahTime: new Date("2026-05-23T18:39:00+07:00") },
  { key: "isha", name: "Isya", time: new Date("2026-05-23T19:45:00+07:00"), iqomahTime: new Date("2026-05-23T19:55:00+07:00") }
];

const now = new Date("2026-05-23T20:52:21+07:00");
const nowMs = now.getTime();

const lastPrayer = [...prayers].reverse().find(p => p.time.getTime() <= nowMs);
console.log("Last Prayer:", lastPrayer?.name);

if (lastPrayer) {
  const secondsSince = Math.floor((nowMs - lastPrayer.time.getTime()) / 1000);
  console.log("secondsSince:", secondsSince);
  if (secondsSince <= 30) {
    console.log("Returned from secondsSince <= 30");
  }
  if (lastPrayer.iqomahTime) {
    const iqomahMs = lastPrayer.iqomahTime.getTime();
    if (nowMs < iqomahMs) {
      console.log("Returned from iqomahTime");
    }
  }
}

const upcoming = prayers.find((p) => p.time.getTime() > nowMs);
console.log("Upcoming Prayer:", upcoming?.name);

if (upcoming) {
  console.log("Returned Upcoming:", upcoming.name);
} else {
  console.log("Returned Tomorrow Next: Imsak");
}
