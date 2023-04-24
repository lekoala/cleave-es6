const groupStyle = {
  thousand: "thousand",
  lakh: "lakh",
  wan: "wan",
  none: "none",
};

class CleaveNumber {
  constructor(
    numeralDecimalMark,
    numeralIntegerScale,
    numeralDecimalScale,
    numeralThousandsGroupStyle,
    numeralPositiveOnly,
    stripLeadingZeroes,
    prefix,
    signBeforePrefix,
    tailPrefix,
    delimiter
  ) {
    this.numeralDecimalMark = numeralDecimalMark || ".";
    this.numeralIntegerScale = numeralIntegerScale > 0 ? numeralIntegerScale : 0;
    this.numeralDecimalScale = numeralDecimalScale >= 0 ? numeralDecimalScale : 2;
    this.numeralThousandsGroupStyle = numeralThousandsGroupStyle || groupStyle.thousand;
    this.numeralPositiveOnly = !!numeralPositiveOnly;
    this.stripLeadingZeroes = stripLeadingZeroes !== false;
    this.prefix = prefix || prefix === "" ? prefix : "";
    this.signBeforePrefix = !!signBeforePrefix;
    this.tailPrefix = !!tailPrefix;
    this.delimiter = delimiter || delimiter === "" ? delimiter : ",";
    this.delimiterRE = delimiter ? new RegExp("\\" + delimiter, "g") : "";
  }

  getRawValue(value) {
    return value.replace(this.delimiterRE, "").replace(this.numeralDecimalMark, ".");
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  padDecimal(value) {
    if (this.numeralDecimalScale === 0) {
      return value;
    }

    value = value.toString();

    let partInteger = value;
    let partDecimal = "";
    if (value.indexOf(this.numeralDecimalMark) >= 0) {
      parts = value.split(this.numeralDecimalMark);
      partInteger = parts[0];
      partDecimal = this.numeralDecimalMark + parts[1].slice(0, this.numeralDecimalScale);
    }

    if (partInteger.toString() === "") {
      partInteger = "0";
    }
    partDecimal = String(partDecimal === "" ? this.numeralDecimalMark : partDecimal).padEnd(
      this.numeralDecimalScale + this.numeralDecimalMark.length,
      "0"
    );

    return partInteger + partDecimal;
  }

  format(value) {
    let parts,
      partSign,
      partSignAndPrefix,
      partInteger,
      partDecimal = "";

    // strip prefix
    if (typeof this.prefix !== "undefined") {
      value = value.replace(this.prefix, "");
    }

    // strip alphabet letters
    value = value
      .replace(/[A-Za-z]/g, "")
      // replace the first decimal mark with reserved placeholder
      .replace(this.numeralDecimalMark, "M")

      // strip non numeric letters except minus and "M"
      // this is to ensure prefix has been stripped
      .replace(/[^\dM-]/g, "")

      // replace the leading minus with reserved placeholder
      .replace(/^\-/, "N")

      // strip the other minus sign (if present)
      .replace(/\-/g, "")

      // replace the minus sign (if present)
      .replace("N", this.numeralPositiveOnly ? "" : "-")

      // replace decimal mark
      .replace("M", this.numeralDecimalMark);

    // strip any leading zeros
    if (this.stripLeadingZeroes) {
      value = value.replace(/^(-)?0+(?=\d)/, "$1");
    }

    partSign = value.slice(0, 1) === "-" ? "-" : "";
    if (typeof this.prefix != "undefined") {
      if (this.signBeforePrefix) {
        partSignAndPrefix = partSign + this.prefix;
      } else {
        partSignAndPrefix = this.prefix + partSign;
      }
    } else {
      partSignAndPrefix = partSign;
    }

    partInteger = value;

    if (value.indexOf(this.numeralDecimalMark) >= 0) {
      parts = value.split(this.numeralDecimalMark);
      partInteger = parts[0];
      partDecimal = this.numeralDecimalMark + parts[1].slice(0, this.numeralDecimalScale);
    }

    if (partSign === "-") {
      partInteger = partInteger.slice(1);
    }

    if (this.numeralIntegerScale > 0) {
      partInteger = partInteger.slice(0, this.numeralIntegerScale);
    }

    switch (this.numeralThousandsGroupStyle) {
      case groupStyle.lakh:
        partInteger = partInteger.replace(/(\d)(?=(\d\d)+\d$)/g, "$1" + this.delimiter);

        break;

      case groupStyle.wan:
        partInteger = partInteger.replace(/(\d)(?=(\d{4})+$)/g, "$1" + this.delimiter);

        break;

      case groupStyle.thousand:
        partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, "$1" + this.delimiter);

        break;
    }

    if (this.tailPrefix) {
      return partSign + partInteger.toString() + (this.numeralDecimalScale > 0 ? partDecimal.toString() : "") + this.prefix;
    }

    return partSignAndPrefix + partInteger.toString() + (this.numeralDecimalScale > 0 ? partDecimal.toString() : "");
  }
}

export default CleaveNumber;
