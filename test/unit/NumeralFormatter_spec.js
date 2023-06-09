import test from "ava";
import CleaveNumber from "../../src/CleaveNumber.js";

var numerals = [
  {
    thousandsGroupStyle: "thousand",
    numbers: [
      ["1234567", "1,234,567"],
      ["-1234567", "-1,234,567"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    numbers: [
      ["01234567", "1,234,567"],
      ["-01234567", "-1,234,567"],
    ],
  },
  {
    thousandsGroupStyle: "none",
    numbers: [
      ["01234567", "1234567"],
      ["-01234567", "-1234567"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    numbers: [
      ["0.1234", "0.12"],
      ["-0.1234", "-0.12"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    numbers: [
      ["00.1234", "0.12"],
      ["-00.1234", "-0.12"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    prefix: "$",
    numbers: [
      ["1234567", "$1,234,567"],
      ["-1234567", "$-1,234,567"],
      ["01234567", "$1,234,567"],
      ["-01234567", "$-1,234,567"],
      ["0.1234", "$0.12"],
      ["-0.1234", "$-0.12"],
      ["00.1234", "$0.12"],
      ["-00.1234", "$-0.12"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    prefix: "$",
    signBeforePrefix: true,
    numbers: [
      ["1234567", "$1,234,567"],
      ["-1234567", "-$1,234,567"],
      ["01234567", "$1,234,567"],
      ["-01234567", "-$1,234,567"],
      ["0.1234", "$0.12"],
      ["-0.1234", "-$0.12"],
      ["00.1234", "$0.12"],
      ["-00.1234", "-$0.12"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    prefix: "$",
    tailPrefix: true,
    numbers: [
      ["1234567", "1,234,567$"],
      ["-1234567", "-1,234,567$"],
      ["01234567", "1,234,567$"],
      ["-01234567", "-1,234,567$"],
      ["0.1234", "0.12$"],
      ["-0.1234", "-0.12$"],
      ["00.1234", "0.12$"],
      ["-00.1234", "-0.12$"],
    ],
  },
  {
    thousandsGroupStyle: "lakh",
    numbers: [
      ["123456789", "12,34,56,789"],
      ["-123456789", "-12,34,56,789"],
    ],
  },
  {
    thousandsGroupStyle: "wan",
    numbers: [
      ["123456789", "1,2345,6789"],
      ["-123456789", "-1,2345,6789"],
    ],
  },
  {
    numeralIntegerScale: 4,
    numbers: [
      ["12", "12"],
      ["1234", "1,234"],
      ["1234567", "1,234"],
      ["-12345", "-1,234"],
    ],
  },
  {
    numeralIntegerScale: 0,
    numbers: [["123456789012345", "123,456,789,012,345"]],
  },
  {
    numbers: [["123456789012345", "123,456,789,012,345"]],
  },
  {
    numeralDecimalScale: 0,
    numbers: [
      ["12.3456789", "12"],
      ["-12.3456789", "-12"],
      ["12.3", "12"],
      ["-12.3", "-12"],
      ["12.3.0", "12"],
      ["-12.3.0", "-12"],
      ["12.3-0", "12"],
      ["-12.3-0", "-12"],
    ],
  },
  {
    numeralDecimalScale: 3,
    numbers: [
      ["12.3456789", "12.345"],
      ["-12.3456789", "-12.345"],
      ["12.3", "12.3"],
      ["-12.3", "-12.3"],
      ["12.3.0", "12.30"],
      ["-12.3.0", "-12.30"],
      ["12.3-0", "12.30"],
      ["-12.3-0", "-12.30"],
    ],
  },
  {
    numeralDecimalMark: ",",
    delimiter: ".",
    numbers: [
      ["1234567,89", "1.234.567,89"],
      ["-1234567,89", "-1.234.567,89"],
    ],
  },
  {
    numeralDecimalMark: ".",
    delimiter: "",
    numbers: [
      ["1,234,567.89", "1234567.89"],
      ["-1,234,567.89", "-1234567.89"],
    ],
  },
  {
    thousandsGroupStyle: "lakh",
    numeralDecimalScale: 4,
    numeralDecimalMark: "'",
    delimiter: "|",
    numbers: [
      ["1234567'8901234", "12|34|567'8901"],
      ["-1234567'8901234", "-12|34|567'8901"],
    ],
  },
  {
    thousandsGroupStyle: "lakh",
    numeralIntegerScale: 6,
    numeralDecimalScale: 3,
    numeralDecimalMark: "'",
    delimiter: "|",
    numbers: [
      ["1234567'8901234", "1|23|456'890"],
      ["-1234567'8901234", "-1|23|456'890"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    numeralPositiveOnly: true,
    numbers: [
      ["1234567", "1,234,567"],
      ["-1234567", "1,234,567"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    stripLeadingZeroes: false,
    numbers: [
      ["000,000", "000,000"],
      ["00", "00"],
      ["000", "000"],
    ],
  },
  {
    thousandsGroupStyle: "thousand",
    prefix: "Skr.",
    numbers: [
      ["1234567", "Skr.1,234,567"],
      ["-1234567", "Skr.-1,234,567"],
      ["01234567", "Skr.1,234,567"],
      ["-01234567", "Skr.-1,234,567"],
      ["0.1234", "Skr.0.12"],
      ["-0.1234", "Skr.-0.12"],
      ["00.1234", "Skr.0.12"],
      ["-00.1234", "Skr.-0.12"],
    ],
  },
];

test("it should format numbers", (t) => {
  numerals.forEach((numeral) => {
    var title = [];
    if (numeral.thousandsGroupStyle) {
      title.push("Thousands Group Style: " + numeral.thousandsGroupStyle);
    }

    if (numeral.numeralIntegerScale) {
      title.push("Integer Scale: " + numeral.numeralIntegerScale);
    }

    if (numeral.numeralDecimalScale || numeral.numeralDecimalScale === 0) {
      title.push("Decimal Scale: " + numeral.numeralDecimalScale);
    }

    if (numeral.numeralDecimalMark) {
      title.push("Decimal Mark: " + numeral.numeralDecimalMark);
    }

    if (numeral.delimiter) {
      title.push("Delimiter: " + numeral.delimiter);
    }

    if (numeral.delimiterOff) {
      title.push("Delimiter Off: " + numeral.delimiterOff);
    }

    if (numeral.numeralPositiveOnly) {
      title.push("Positive Only: " + numeral.numeralPositiveOnly);
    }

    if (numeral.stripLeadingZeroes) {
      title.push("Strip leading zeroes:" + numeral.stripLeadingZeroes);
    }

    if (numeral.prefix) {
      title.push("Prefix:" + numeral.prefix);
    }

    if (numeral.signBeforePrefix) {
      title.push("Sign before prefix:" + numeral.signBeforePrefix);
    }

    if (numeral.tailPrefix) {
      title.push("Tail prefix:" + numeral.tailPrefix);
    }

    var numeralFormatter = new CleaveNumber(
      numeral.numeralDecimalMark,
      numeral.numeralIntegerScale,
      numeral.numeralDecimalScale,
      numeral.thousandsGroupStyle,
      numeral.numeralPositiveOnly,
      numeral.stripLeadingZeroes,
      numeral.prefix,
      numeral.signBeforePrefix,
      numeral.tailPrefix,
      numeral.delimiter
    );

    numeral.numbers.forEach((number) => {
      var message = "should convert number " + number[0] + " to " + number[1] + " (" + title.join(",") + ")";
      t.is(numeralFormatter.format(number[0]), number[1], message);
      // In addition to testing the function starting with a 'raw' value, also test with a formatted value.
      message = "should convert number " + number[1] + " to " + number[1] + " (" + title.join(",") + ")";
      t.is(numeralFormatter.format(number[1]), number[1], message);
    });
  });
});
