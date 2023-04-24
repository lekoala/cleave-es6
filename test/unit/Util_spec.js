import test from "ava";
import CleaveUtils from "../../src/CleaveUtils.js";
import CleaveDate from "../../src/CleaveDate.js";
import CleaveTime from "../../src/CleaveTime.js";

var json = {
  stripDelimiters: [
    {
      params: ["12-3", "-", []],
      expected: "123",
    },
    {
      params: ["1203", "0", []],
      expected: "123",
    },
    {
      params: ["1273", "7", []],
      expected: "123",
    },
    {
      params: ["12-45 78|0", "", ["-", " ", "|"]],
      expected: "1245780",
    },
    {
      params: ["123456789", "", ["3", "5", "7", "9"]],
      expected: "12468",
    },
  ],
  getFormattedValue: [
    {
      params: ["123", [3, 3], 2, "-", [], false],
      expected: "123-",
    },
    {
      params: ["123456", [3, 3], 2, "-", [], false],
      expected: "123-456",
    },
    {
      params: ["123", [3, 3], 2, "-", [], true],
      expected: "123",
    },
    {
      params: ["12345", [3, 3], 2, "-", [], true],
      expected: "123-45",
    },
    {
      params: ["123456", [3, 3, 3], 3, "", ["-", "X"], true],
      expected: "123-456",
    },
    {
      params: ["123456789", [3, 3, 3], 3, "", ["-", "X"], true],
      expected: "123-456X789",
    },
  ],
  getPrefixStrippedValue: [
    {
      params: ["test123", "test", 4, "test12", "-", [], false],
      expected: "123",
    },
    {
      params: ["1", "test", 4, "", "-", [], false],
      expected: "",
    },
    {
      params: ["1", "test", 4, "", "-", [], true],
      expected: "1",
    },
    {
      params: ["test123", "test", 4, "tst", "-", []],
      expected: "",
    },
    {
      params: ["tst123", "test", 4, "test12", "-", []],
      expected: "12",
    },
    {
      params: ["-test123", "test", 4, "-test123", "-", [], false, false, true],
      expected: "-123",
    },
  ],
  getDateTimeValue: [
    {
      params: ["22041999230355", ["d", "m", "Y"], ["h", "m", "s"], ["/", "/", " ", ":", ":"]],
      expected: "22041999230355",
    },
    {
      params: ["22/04/1999 23:03:55", ["d", "m", "Y"], ["h", "m", "s"], ["/", "/", " ", ":", ":"]],
      expected: "22041999230355",
    },
    {
      params: ["12/31 && 23.59", ["m", "d"], ["h", "m"], ["/", " && ", "."]],
      expected: "12312359",
    },
    {
      params: ["02/22 && 03.30", ["m", "d"], ["h", "m"], ["/", " && ", "."]],
      expected: "02220330",
    },
    {
      params: ["22234123", ["m", "d"], ["h", "m"], ["/", " && ", "."]],
      expected: "02230423",
    },
    {
      params: ["22/23 41:23", ["m", "d"], ["h", "m"], ["/", " ", ":"]],
      expected: "02230423",
    },
    {
      params: ["99/02/24 23:22:11", ["y", "m", "d"], ["h", "m", "s"], ["/", "/", " ", ":", ":"]],
      expected: "990224232211",
    },
    {
      params: ["2300/10/01 09:00:00", ["Y", "m", "d"], ["h", "m", "s"], ["/", "/", " ", ":", ":"]],
      expected: "23001001090000",
    },
  ],
};

test("test stripDelimiters", (t) => {
  json.stripDelimiters.forEach((data) => {
    var params = data.params;
    var msg = "should strip delimiter for: " + params[0] + " to: " + data.expected;
    t.is(CleaveUtils.stripDelimiters(params[0], params[1], params[2]), data.expected, msg);
  });
});

test("test getFormattedValue", (t) => {
  json.getFormattedValue.forEach((data) => {
    var params = data.params;
    var msg = "should get formatted value for: " + params[0] + " as: " + data.expected;
    t.is(CleaveUtils.getFormattedValue(params[0], params[1], params[2], params[3], params[4], params[5]), data.expected, msg);
  });
});

test("test getPrefixStrippedValue", (t) => {
  json.getPrefixStrippedValue.forEach((data) => {
    var params = data.params;
    var msg = "should get prefix stripped value for: " + params[0] + " as: " + data.expected;
    t.is(
      CleaveUtils.getPrefixStrippedValue(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]),
      data.expected,
      msg
    );
  });
});

test("test getDateTimeValue", (t) => {
  json.getDateTimeValue.forEach((data) => {
    var params = data.params;
    var params = data.params;
    var value = params[0];
    var dateFormatter = new CleaveDate(params[1], "", "");
    var timeFormatter = new CleaveTime(params[2], 24);
    var delimiters = params[3];

    var msg = "should get datetime value for: " + params[0] + " as: " + data.expected;
    t.is(CleaveUtils.getDateTimeValue(value, dateFormatter, timeFormatter, delimiters), data.expected, msg);
  });
});
