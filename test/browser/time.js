import test from "ava";
import Cleave from "../../src/Cleave.js";

test("should format fully matched input value", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
  });

  cleave.setRawValue("231515");
  t.is(field.value, "23:15:15");
});

test("should format partially matched input value", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
  });

  cleave.setRawValue("2315");
  t.is(field.value, "23:15:");
});

test("should correct large time hour to 23", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
  });

  cleave.setRawValue("25");
  t.is(field.value, "23:");
});

test("should correct large time hour to add leading 0", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
  });

  cleave.setRawValue("4");
  t.is(field.value, "04:");
});

test("should correct large min to add leading 0", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
  });

  cleave.setRawValue("147");
  t.is(field.value, "14:07:");
});

test("should correct large sec to add leading 0", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
  });

  cleave.setRawValue("14147");
  t.is(field.value, "14:14:07");
});

test("should format fully matched input value (time)", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
    timePattern: ["m", "s"],
  });

  cleave.setRawValue("5555");
  t.is(field.value, "55:55");
});

test("should get correct ISO time", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    time: true,
    timePattern: ["h", "m", "s"],
  });

  cleave.setRawValue("808080");
  t.is(cleave.getISOFormatTime(), "08:08:08");
});
