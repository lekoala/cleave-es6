class CleaveUtils {
  static strip(value, re) {
    return value.replace(re, "");
  }

  static filterByRegex(str, expr, delimiters = []) {
    const regex = new RegExp(expr);
    return str
      .split("")
      .filter((char, i) => {
        if (delimiters.includes(char)) {
          return true;
        }
        return regex.test(char);
      })
      .join("");
  }

  static getPostDelimiter(value, delimiter, delimiters) {
    // single delimiter
    if (delimiters.length === 0) {
      return value.slice(-delimiter.length) === delimiter ? delimiter : "";
    }

    // multiple delimiters
    // @link https://github.com/nosir/cleave.js/pull/579/files
    let matchedDelimiter = "";
    for (let i = 0; i < delimiters.length; i++) {
      let current = delimiters[i];
      if (value.slice(-current.length) === current) {
        matchedDelimiter = current;
        break;
      }
    }

    return matchedDelimiter;
  }

  static getDelimiterREByDelimiter(delimiter) {
    return new RegExp(delimiter.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "g");
  }

  static getNextCursorPosition(prevPos, oldValue, newValue, delimiter, delimiters) {
    // If cursor was at the end of value, just place it back.
    // Because new value could contain additional chars.
    if (oldValue.length === prevPos) {
      return newValue.length;
    }

    return prevPos + this.getPositionOffset(prevPos, oldValue, newValue, delimiter, delimiters);
  }

  static getPositionOffset(prevPos, oldValue, newValue, delimiter, delimiters) {
    let oldRawValue, newRawValue, lengthOffset;

    oldRawValue = this.stripDelimiters(oldValue.slice(0, prevPos), delimiter, delimiters);
    newRawValue = this.stripDelimiters(newValue.slice(0, prevPos), delimiter, delimiters);
    lengthOffset = oldRawValue.length - newRawValue.length;

    return lengthOffset !== 0 ? lengthOffset / Math.abs(lengthOffset) : 0;
  }

  static stripDelimiters(value, delimiter, delimiters) {
    // single delimiter
    if (delimiters.length === 0) {
      let delimiterRE = delimiter ? this.getDelimiterREByDelimiter(delimiter) : "";

      return value.replace(delimiterRE, "");
    }

    // multiple delimiters
    delimiters.forEach((current) => {
      current.split("").forEach((letter) => {
        value = value.replace(this.getDelimiterREByDelimiter(letter), "");
      });
    });

    return value;
  }

  static headStr(str, length) {
    return str.slice(0, length);
  }

  /**
   * Get raw max length
   * @param {Array} blocks
   * @returns {Number}
   */
  static getMaxLength(blocks) {
    return blocks.reduce((previous, current) => {
      return previous + current;
    }, 0);
  }

  // strip prefix
  // Before type  |   After type    |     Return value
  // PEFIX-...    |   PEFIX-...     |     ''
  // PREFIX-123   |   PEFIX-123     |     123
  // PREFIX-123   |   PREFIX-23     |     23
  // PREFIX-123   |   PREFIX-1234   |     1234
  static getPrefixStrippedValue(
    value,
    prefix,
    prefixLength,
    prevResult,
    delimiter,
    delimiters,
    noImmediatePrefix,
    tailPrefix,
    signBeforePrefix
  ) {
    // No prefix
    if (prefixLength === 0) {
      return value;
    }

    // Value is prefix
    if (value === prefix && value !== "") {
      return "";
    }

    if (signBeforePrefix && value.slice(0, 1) == "-") {
      let prev = prevResult.slice(0, 1) == "-" ? prevResult.slice(1) : prevResult;
      return (
        "-" +
        this.getPrefixStrippedValue(
          value.slice(1),
          prefix,
          prefixLength,
          prev,
          delimiter,
          delimiters,
          noImmediatePrefix,
          tailPrefix,
          signBeforePrefix
        )
      );
    }

    // Pre result prefix string does not match pre-defined prefix
    if (prevResult.slice(0, prefixLength) !== prefix && !tailPrefix) {
      // Check if the first time user entered something
      if (noImmediatePrefix && !prevResult && value) return value;
      return "";
    } else if (prevResult.slice(-prefixLength) !== prefix && tailPrefix) {
      // Check if the first time user entered something
      if (noImmediatePrefix && !prevResult && value) return value;
      return "";
    }

    let prevValue = this.stripDelimiters(prevResult, delimiter, delimiters);

    // New value has issue, someone typed in between prefix letters
    // Revert to pre value
    if (value.slice(0, prefixLength) !== prefix && !tailPrefix) {
      return prevValue.slice(prefixLength);
    } else if (value.slice(-prefixLength) !== prefix && tailPrefix) {
      return prevValue.slice(0, -prefixLength - 1);
    }

    // No issue, strip prefix for new value
    return tailPrefix ? value.slice(0, -prefixLength) : value.slice(prefixLength);
  }

  static getFirstDiffIndex(prev, current) {
    let index = 0;

    while (prev.charAt(index) === current.charAt(index)) {
      if (prev.charAt(index++) === "") {
        return -1;
      }
    }

    return index;
  }

  static getFormattedValue(value, blocks, blocksLength, delimiter, delimiters, delimiterLazyShow) {
    let result = "",
      multipleDelimiters = delimiters.length > 0,
      currentDelimiter = "";

    // no options, normal input
    if (blocksLength === 0) {
      return value;
    }

    blocks.forEach((length, index) => {
      if (value.length > 0) {
        let sub = value.slice(0, length),
          rest = value.slice(length);

        if (multipleDelimiters) {
          currentDelimiter = delimiters[delimiterLazyShow ? index - 1 : index] || currentDelimiter;
        } else {
          currentDelimiter = delimiter;
        }

        if (delimiterLazyShow) {
          if (index > 0) {
            result += currentDelimiter;
          }

          result += sub;
        } else {
          result += sub;

          if (sub.length === length && index < blocksLength - 1) {
            result += currentDelimiter;
          }
        }

        // update remaining string
        value = rest;
      }
    });

    return result;
  }

  /**
   * Move cursor to the end the first time user focuses on an input with prefix
   * @param {HTMLElement} el
   * @param {string} prefix
   * @param {string} delimiter
   * @param {Array} delimiters
   * @param {Boolean} tailPrefix
   * @returns {void}
   */
  static fixPrefixCursor(el, prefix, delimiter, delimiters, tailPrefix = false) {
    if (!el) {
      return;
    }

    let val = el.value,
      appendix = delimiter || delimiters[0] || " ";

    if (!el.setSelectionRange || !prefix) {
      return;
    }
    // Value is already bigger than prefix
    if (!tailPrefix && prefix.length + appendix.length <= val.length) {
      return;
    }

    // set timeout to avoid blink
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = tailPrefix ? el.value.length - prefix.length : el.value.length;
    }, 0);
  }

  /**
   * Check if input field is fully selected
   * @param {*} value
   * @returns {Boolean}
   */
  static checkFullSelection(value) {
    try {
      let selection = window.getSelection() || document.getSelection() || {};
      return selection.toString().length === value.length;
    } catch (ex) {
      // Ignore
    }

    return false;
  }

  static setSelection(element, position, doc) {
    if (element !== this.getActiveElement(doc)) {
      return;
    }

    // cursor is already in the end
    if (element && element.value.length <= position) {
      return;
    }

    if (element.createTextRange) {
      let range = element.createTextRange();

      range.move("character", position);
      range.select();
    } else {
      try {
        element.setSelectionRange(position, position);
      } catch (e) {
        // eslint-disable-next-line
        console.warn("The input element type does not support selection");
      }
    }
  }

  static getActiveElement(parent) {
    let activeElement = parent.activeElement;
    if (activeElement && activeElement.shadowRoot) {
      return this.getActiveElement(activeElement.shadowRoot);
    }
    return activeElement;
  }

  // static isAndroid() {
  //   return navigator && /android/i.test(navigator.userAgent);
  // }

  static getDateTimeValue(value, dateFormatter, timeFormatter, delimiters) {
    let splitDelimiterIndex = dateFormatter.getBlocks().length - 1;
    let splitDelimiter = delimiters[splitDelimiterIndex];

    let dateMaxStringLength = dateFormatter.getMaxStringLength();

    let splittedValues = value.split(splitDelimiter);

    // Split even if it is raw value
    if (splittedValues.length == 1 && value.length > dateMaxStringLength) {
      splittedValues = [value.substring(0, dateMaxStringLength), value.substring(dateMaxStringLength)];
    }

    let dateValue = splittedValues[0] ? dateFormatter.getValidatedDate(splittedValues[0]) : "";
    let timeValue = splittedValues[1] ? timeFormatter.getValidatedTime(splittedValues[1]) : "";

    if (timeValue) value = dateValue + timeValue;
    else value = dateValue;

    return value;
  }
}

export default CleaveUtils;
