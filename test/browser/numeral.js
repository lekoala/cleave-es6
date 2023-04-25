import test from "ava";
import Cleave from "../../src/Cleave.js";

test("should add large number delimiter", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
  });

  cleave.setRawValue("1234.56");
  t.is(field.value, "1,234.56");
});

test("should use defined decimal scale", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralDecimalScale: 4,
  });

  cleave.setRawValue("1.2345678");
  t.is(field.value, "1.2345");
});

test("should use defined decimal mark", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralDecimalMark: ",",
    delimiter: ".",
  });

  cleave.setRawValue("1234.56");
  t.is(field.value, "1.234,56");
});

test("should use defined group lakh style", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralThousandsGroupStyle: "lakh",
  });

  cleave.setRawValue("12345678.90");
  t.is(field.value, "1,23,45,678.90");
});

test("should use defined group wan style", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralThousandsGroupStyle: "wan",
  });

  cleave.setRawValue("123456789.01");
  t.is(field.value, "1,2345,6789.01");
});

test("should use no comma style", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralThousandsGroupStyle: "none",
  });

  cleave.setRawValue("123456789.01");
  t.is(field.value, "123456789.01");
});

test("should use defined positive only option", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralPositiveOnly: true,
  });

  cleave.setRawValue("-1234.56");
  t.is(field.value, "1,234.56");
});

test("it should not strip leading zeroes", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    stripLeadingZeroes: false,
  });

  cleave.setRawValue("000,001.01");
  t.is(field.value, "000,001.01");
});

test("should have strict positive numbers", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralPositiveOnly: true,
    numeralPositiveStrict: true,
  });

  field.value = "0";
  t.not(field.value, "");
  cleave.onblur();
  t.is(field.value, "");

  field.value = ".";
  t.not(field.value, "");
  cleave.onblur();
  t.is(field.value, "");
});

test("it should pad decimals on blur", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralPositiveOnly: true,
    numeralDecimalPadding: true,
  });

  field.value = "0";
  cleave.onblur();
  t.is(field.value, "0.00");

  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralPositiveOnly: true,
    numeralDecimalPadding: true,
    numeralDecimalScale: 4,
  });

  field.value = "0";
  cleave.onblur();
  t.is(field.value, "0.0000");
});

test("it should not pad decimals blank on blur", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numeral: true,
    numeralPositiveOnly: true,
    numeralDecimalPadding: true,
  });

  field.value = "";
  cleave.onblur();
  t.is(field.value, "");
});
