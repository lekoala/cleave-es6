import test from "ava";
import Cleave from "../../src/Cleave.js";

test("should use custom blocks", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    blocks: [3, 3, 3],
  });

  cleave.setRawValue("123456789");
  t.is(field.value, "123 456 789");
});

test("should use lazy show mode for delimiter", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    blocks: [3, 3, 3],
    delimiterLazyShow: true,
    delimiter: "|",
  });

  cleave.setRawValue("123456");
  t.is(field.value, "123|456");
});

test("should use custom delimiter", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    blocks: [3, 3, 3],
    delimiter: "|",
  });

  cleave.setRawValue("123456789");
  t.is(field.value, "123|456|789");
});

test("should use custom multiple delimiters", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    blocks: [3, 3, 3, 3],
    delimiters: ["-", "-", "~"],
  });

  cleave.setRawValue("123456789000");
  t.is(field.value, "123-456-789~000");
});

test("should use custom multiple delimiters with more than one letter", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    blocks: [0, 3, 3, 3],
    delimiters: ["(", ") ", " - "],
  });

  cleave.setRawValue("123456789000");
  t.is(field.value, "(123) 456 - 789");
});

test("should use custom multiple delimiters with default value", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    blocks: [3, 3, 3, 3],
    delimiters: ["-", "~"],
  });

  cleave.setRawValue("123456789000");
  t.is(field.value, "123-456~789~000");
});

test("should use empty delimiter", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    blocks: [3, 3, 3],
    delimiter: "",
  });

  cleave.setRawValue("123456789");
  t.is(field.value, "123456789");
});

test("should use defined prefix", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    prefix: "UFO",
    blocks: [3, 3],
    delimiter: "-",
  });

  cleave.setRawValue("UFO123");
  t.is(field.value, "UFO-123");
});

test("should use defined prefix with noImmediatePrefix enabled", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    prefix: "GTM-",
    noImmediatePrefix: true,
  });

  cleave.setRawValue("1001");
  t.is(cleave.getFormattedValue(), "GTM-1001");
});

test("should use defined prefix with noImmediatePrefix enabled (empty)", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    prefix: "GTM-",
    noImmediatePrefix: true,
  });

  cleave.setRawValue("");
  t.is(cleave.getFormattedValue(), "GTM-");
});

test("should not trim prefix when rawValueTrimPrefix is not enabled", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    prefix: "$",
    rawValueTrimPrefix: true,
    numeral: true,
  });

  cleave.setRawValue("1234.56");
  t.is(cleave.getRawValue(), "1234.56");
});

test("should trim prefix when rawValueTrimPrefix is enabled", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    prefix: "$",
    numeral: true,
  });

  cleave.setRawValue("1234.56");
  t.is(cleave.getRawValue(), "$1234.56");
});

test("should use numeric only option", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    numericOnly: true,
    blocks: [3, 3, 3],
  });

  cleave.setRawValue("12a3b4c5");
  t.is(field.value, "123 45");
});

test("should use uppercase option", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    uppercase: true,
    blocks: [3, 3, 3],
  });

  cleave.setRawValue("abcdef");
  t.is(field.value, "ABC DEF ");
});

test("should use lowercase option", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    lowercase: true,
    blocks: [3, 3, 3],
  });

  cleave.setRawValue("ABCDEF");
  t.is(field.value, "abc def ");
});

test("should use ucfirst option", (t) => {
  var field = document.createElement("input");
  var cleave = new Cleave(field, {
    ucfirst: true,
    blocks: [3, 3, 3],
  });

  cleave.setRawValue("ABCDEF");
  t.is(field.value, "Abc def ");
});
