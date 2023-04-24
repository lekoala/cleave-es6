import test from "ava";
import CleaveTime from "../../src/CleaveTime.js";

var timeGroups = [
  {
    timePattern: ["h", "m", "s"],
    time: [
      ["232323", "232323"],
      ["236161", "230606"],
      ["250101", "230101"],
      ["232323000", "232323"],
      ["3", "03"],
      ["037", "0307"],
      ["03077", "030707"],
    ],
  },
  {
    timePattern: ["s", "m", "h"],
    time: [
      ["232323", "232323"],
      ["616123", "060623"],
      ["010125", "010123"],
      ["232323000", "232323"],
      ["7", "07"],
      ["077", "0707"],
      ["07073", "070703"],
    ],
  },
  {
    timePattern: ["h", "m"],
    time: [
      ["0718", "0718"],
      ["2518", "2318"],
      ["071899", "0718"],
      ["0008", "0008"],
      ["9018", "0918"],
    ],
  },
  {
    timeFormat: "12",
    timePattern: ["h", "m"],
    time: [
      ["0718", "0718"],
      ["2018", "0218"],
      ["0008", "0008"],
      ["9018", "0918"],
    ],
  },
  {
    timeFormat: "12",
    timePattern: ["h", "m", "s"],
    time: [
      ["0718", "0718"],
      ["2518", "0218"],
      ["071899", "071809"],
      ["232323000", "022323"],
      ["2323230", "022323"],
      ["2370700", "020707"],
    ],
  },
];

test("it should format time", (t) => {
  timeGroups.forEach((timeGroup) => {
    var desc = "pattern: " + timeGroup.timePattern.join(", ");
    var timeFormatter = new CleaveTime(timeGroup.timePattern, timeGroup.timeFormat);

    timeGroup.time.forEach((time) => {
      var message = "should convert time " + time[0] + " to " + time[1] + " (" + desc + ")";
      t.is(timeFormatter.getValidatedTime(time[0]), time[1], message);
    });
  });
});
