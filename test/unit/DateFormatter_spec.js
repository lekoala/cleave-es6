import test from "ava";
import CleaveDate from "../../src/CleaveDate.js";

var dateGroups = [
  {
    datePattern: ["d", "m", "Y"],
    date: [
      ["01071965", "01071965"],
      ["21/071965", "21071965"],
      ["99071965", "09071965"],
      ["30022016", "29022016"],
      ["29022017", "28022017"],
      ["31042017", "30042017"],
      ["08991965", "08091965"],
      ["08121965000", "08121965"],
      ["08001965", "08011965"],
      ["08141965", "08121965"],
      ["4", "04"],
      ["3106", "3006"],
      ["00000000", "01010000"],
      ["00000001", "01010001"],
      ["00000012", "01010012"],
      ["00000123", "01010123"],
    ],
  },
  {
    datePattern: ["Y", "m", "d"],
    date: [
      ["20170931", "20170930"],
      ["20170229", "20170228"],
      ["20160229", "20160229"],
      ["00000000", "00000101"],
      ["00010000", "00010101"],
      ["00120000", "00120101"],
      ["01230000", "01230101"],
    ],
  },
  {
    datePattern: ["d", "m", "y"],
    date: [
      ["010765", "010765"],
      ["330765", "310765"],
      ["089965", "080965"],
      ["08126599", "081265"],
      ["08/18*6599", "081265"],
      ["080065", "080165"],
      ["000865", "010865"],
      ["900065", "090165"],
    ],
  },
  {
    datePattern: ["m", "y"],
    date: [
      ["0718", "0718"],
      ["1918", "1218"],
      ["071899", "0718"],
      ["0008", "0108"],
      ["9018", "0918"],
    ],
  },
  {
    datePattern: ["m", "y"],
    dateMin: "08-11",
    dateMax: "40-01",
    date: [
      ["1207", "1108"],
      ["0250", "0140"],
    ],
  },
  {
    datePattern: ["d", "m", "Y"],
    dateMin: "2001-01-01",
    dateMax: "2099-12-31",
    date: [
      ["01121998", "01012001"],
      ["01012100", "31122099"],
    ],
  },
];

test("it should format date", (t) => {
  dateGroups.forEach((dateGroup) => {
    var boundary = dateGroup.dateMin || dateGroup.dateMax;
    var desc =
      "pattern: " + dateGroup.datePattern.join(", ") + (boundary ? " min: " + dateGroup.dateMin + " max: " + dateGroup.dateMax : "");
    var dateFormatter = new CleaveDate(dateGroup.datePattern, dateGroup.dateMin || "", dateGroup.dateMax || "");

    dateGroup.date.forEach((date) => {
      var message = "should convert date " + date[0] + " to " + date[1] + " (" + desc + ")";
      t.is(dateFormatter.getValidatedDate(date[0]), date[1], message);
    });
  });
});
