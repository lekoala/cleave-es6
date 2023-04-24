import test from "ava";
import Cleave from "../../src/Cleave.js";

test("should format fully matched input value", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
  });

  cleave.setRawValue("11041965");
  t.is(field.value, "11/04/1965");
});

test("should format partially matched input value", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
  });

  cleave.setRawValue("1207");
  t.is(field.value, "12/07/");
});

test("should correct large date to 31", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
  });

  cleave.setRawValue("33");
  t.is(field.value, "31/");
});

test("should correct large date to add leading 0", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
  });

  cleave.setRawValue("4");
  t.is(field.value, "04/");
});

test("should correct large month to 12", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
  });

  cleave.setRawValue("1214");
  t.is(field.value, "12/12/");
});

test("should correct large month to add leading 0", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
  });

  cleave.setRawValue("127");
  t.is(field.value, "12/07/");
});

test("should format fully matched input value (ymd)", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
    datePattern: ["Y", "m", "d"],
  });

  cleave.setRawValue("19650411");
  t.is(field.value, "1965/04/11");
});

test("should get correct ISO date", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    date: true,
    datePattern: ["m", "Y", "d"],
  });

  cleave.setRawValue("04196511");
  t.is(cleave.getISOFormatDate(), "1965-04-11");
});
