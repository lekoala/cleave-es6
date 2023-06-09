import CleaveUtils from "./CleaveUtils.js";
import CleaveDate from "./CleaveDate.js";
import CleaveTime from "./CleaveTime.js";
import CleaveNumber from "./CleaveNumber.js";

/**
 * @typedef CleaveConfig
 * @property {boolean} time
 * @property {Array} timePattern
 * @property {string} timeFormat
 * @property {CleaveTime} timeFormatter
 * @property {boolean} date
 * @property {Array} datePattern
 * @property {string} dateMin
 * @property {string} dateMax
 * @property {CleaveDate} dateFormatter
 * @property {boolean} numeral
 * @property {Number} numeralIntegerScale
 * @property {Number} numeralDecimalScale
 * @property {string} numeralDecimalMark
 * @property {string} numeralThousandsGroupStyle
 * @property {boolean} numeralDecimalPadding
 * @property {boolean} numeralPositiveOnly
 * @property {boolean} numeralPositiveStrict
 * @property {boolean} stripLeadingZeroes
 * @property {boolean} signBeforePrefix
 * @property {boolean} tailPrefix
 * @property {CleaveNumber} numeralFormatter
 * @property {boolean} swapHiddenInput
 * @property {boolean} numericOnly
 * @property {boolean} hexadecimalOnly
 * @property {boolean} uppercase
 * @property {boolean} lowercase
 * @property {boolean} ucfirst
 * @property {string} prefix
 * @property {boolean} noImmediatePrefix
 * @property {boolean} rawValueTrimPrefix
 * @property {boolean} copyDelimiter
 * @property {string} delimiter
 * @property {boolean} delimiterLazyShow
 * @property {Array} delimiters
 * @property {Array} blocks
 * @property {string} allowedChars
 * @property {Function} onValueChanged
 * @property {Function} onBeforeInput
 * @property {Function} onAfterInput
 * @property {Number} maxLength
 */

/**
 * @type {CleaveConfig}
 */
const defaultConfig = {
  // time
  time: false,
  timePattern: ["h", "m", "s"],
  timeFormat: "24",
  timeFormatter: null,
  // date
  date: false,
  datePattern: ["d", "m", "Y"],
  dateMin: "",
  dateMax: "",
  dateFormatter: null,
  // numeral
  numeral: false,
  numeralIntegerScale: 0,
  numeralDecimalScale: 2,
  numeralDecimalMark: ".",
  numeralThousandsGroupStyle: "thousand",
  numeralDecimalPadding: false,
  numeralPositiveOnly: false,
  numeralPositiveStrict: false,
  stripLeadingZeroes: false,
  signBeforePrefix: false,
  tailPrefix: false,
  numeralFormatter: null,
  // other
  swapHiddenInput: false,
  numericOnly: false,
  hexadecimalOnly: false,
  uppercase: false,
  lowercase: false,
  ucfirst: false,
  prefix: "",
  noImmediatePrefix: false,
  rawValueTrimPrefix: false,
  copyDelimiter: false,
  delimiter: "",
  delimiterLazyShow: false,
  delimiters: [],
  blocks: [],
  allowedChars: null,
  onValueChanged: null,
  onBeforeInput: null,
  onAfterInput: null,
  maxLength: 0,
};

const events = ["input", "keydown", "focus", "cut", "copy", "blur", "compositionstart", "compositionend"];
const instances = new WeakMap();

/**
 * ES6 port of Cleave
 * @link https://github.com/nosir/cleave.js
 */
class Cleave {
  /**
   *
   * @param {HTMLInputElement} el
   * @param {CleaveConfig} opts
   */
  constructor(el, opts = {}) {
    if (!(el instanceof HTMLInputElement)) {
      console.error("Invalid element");
      return;
    }

    /**
     * @type {CleaveConfig}
     */
    this.config = Object.assign(
      {},
      defaultConfig,
      {
        delimiter: this.getDefaultDelimiter(opts),
      },
      opts
    );

    if (this.isDate() || (this.isTime() && this.config.timeFormat === "24")) {
      this.config.numericOnly = true;
    }
    if ((this.config.numericOnly || this.config.numeral) && !el.hasAttribute("inputmode")) {
      // @link https://css-tricks.com/everything-you-ever-wanted-to-know-about-inputmode/#aa-decimal
      el.setAttribute("inputmode", "decimal");
    }

    this.initValue = el.value;
    this.element = el;

    instances.set(el, this);

    /**
     * The new value to apply in updateValueState
     * @type {string}
     */
    this.result = "";

    this.init();
  }

  /**
   * @param {HTMLElement} el
   * @returns {Cleave}
   */
  static getInstance(el) {
    if (instances.has(el)) {
      return instances.get(el);
    }
  }

  /**
   * @returns {Boolean}
   */
  isTime() {
    return this.config.time === true;
  }

  /**
   * @returns {Boolean}
   */
  isDate() {
    return this.config.date === true;
  }

  /**
   * @returns {Boolean}
   */
  isNumeral() {
    return this.config.numeral === true;
  }

  /**
   * @param {CleaveConfig} opts
   * @returns {string|Array}
   */
  getDefaultDelimiter(opts) {
    if (opts.date && opts.time) {
      return [this.getDelimitersFromPattern(opts.datePattern, "/"), " ", this.getDelimitersFromPattern(opts.timePattern, ":")].flat();
    }
    return opts.date ? "/" : opts.time ? ":" : opts.numeral ? "," : " ";
  }

  /**
   *
   * @param {Array} patternArray
   * @param {string} delimiterToInsert
   * @returns {string}
   */
  getDelimitersFromPattern(patternArray, delimiterToInsert) {
    return patternArray.flatMap(function (value, index) {
      if (index == 0) return [];
      return delimiterToInsert;
    });
  }

  init() {
    // this.isAndroid = CleaveUtils.isAndroid();
    this.lastInputValue = "";
    this.isBackward = false;
    //@link https://github.com/nosir/cleave.js/pull/663/commits/af08e17c0138ad1eb522f8e3addf70abed7dc5b9
    this.isComposition = false;

    this.initSwapHiddenInput();

    // Use an arrow function rather than a class method to make sure of this value
    // Since we listen on this.element, it could be bound to the input rather than Cleave
    this.handleEvent = (event) => {
      this._handleEvent(event);
    };
    events.forEach((type) => {
      this.element.addEventListener(type, this);
    });

    this.setBlocks();

    // avoid touch input field if value is null
    // otherwise Firefox will add red box-shadow for <input required />
    if (this.initValue || (this.config.prefix && !this.config.noImmediatePrefix)) {
      this.setRawValue(this.initValue);
    }
  }

  handleEvent(event) {
    this._handleEvent(event);
  }

  _handleEvent(event) {
    if (events.includes(event.type)) {
      this[`on${event.type}`](event);
    }
  }

  setBlocks(blocks = null) {
    if (blocks) {
      this.config.blocks = blocks;
    }
    // This is the raw maxLength. Maybe at some point it would make sense to use regular html input maxlength ??
    this.config.maxLength = CleaveUtils.getMaxLength(this.config.blocks);

    this.initDateFormatter();
    this.initTimeFormatter();
    this.initNumeralFormatter();
  }

  setConfig(k, v) {
    this.config[k] = v;
  }

  initSwapHiddenInput() {
    if (!this.config.swapHiddenInput) {
      return;
    }

    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = this.element.name;
    hiddenInput.value = this.initValue;

    // insert after
    this.element.parentNode.insertBefore(hiddenInput, this.element.nextSibling);

    this.elementSwapHidden = hiddenInput;

    // keep formatted value (we use prefix for fields like name[arr][val])
    this.element.name = `cleave_${this.element.name}`;
  }

  initNumeralFormatter() {
    const pps = this.config;

    if (!pps.numeral) {
      return;
    }

    pps.numeralFormatter = new CleaveNumber(
      pps.numeralDecimalMark,
      pps.numeralIntegerScale,
      pps.numeralDecimalScale,
      pps.numeralThousandsGroupStyle,
      pps.numeralPositiveOnly,
      pps.stripLeadingZeroes,
      pps.prefix,
      pps.signBeforePrefix,
      pps.tailPrefix,
      pps.delimiter
    );
  }

  initTimeFormatter() {
    const pps = this.config;

    if (!pps.time) {
      return;
    }

    pps.timeFormatter = new CleaveTime(pps.timePattern, pps.timeFormat);

    const timeFormatterBlocks = pps.timeFormatter.getBlocks();
    if (!pps.date) {
      pps.blocks = timeFormatterBlocks;
    } else {
      pps.blocks = pps.blocks.concat(timeFormatterBlocks);
    }

    pps.maxLength = CleaveUtils.getMaxLength(pps.blocks);
  }

  initDateFormatter() {
    const pps = this.config;

    if (!pps.date) {
      return;
    }

    pps.dateFormatter = new CleaveDate(pps.datePattern, pps.dateMin, pps.dateMax);
    pps.blocks = pps.dateFormatter.getBlocks();
    pps.maxLength = CleaveUtils.getMaxLength(pps.blocks);
  }

  onkeydown(event) {
    const pps = this.config;
    const charCode = event.which || event.keyCode;

    this.lastInputValue = this.element.value;
    this.isBackward = charCode === 8;
  }

  oncompositionstart(event) {
    this.isComposition = true;
  }

  oncompositionend(event) {
    this.isComposition = false;
    this.oninput(event);
  }

  onblur(event) {
    const pps = this.config;
    let value = parseFloat(this.getRawValue(true));

    // The value can be empty
    if (this.element.value.length > 0) {
      // numeral formatter
      // @link https://github.com/nosir/cleave.js/pull/660/commits/c0a3359905ce4b72530d51cab0e71d22b0c6c601
      if (
        pps.numeral &&
        (isNaN(value) || // if `.` only entered
          (pps.numeralPositiveStrict && value === 0))
      ) {
        this.result = "";
        this.updateValueState();
        return;
      }

      // numeralDecimalPadding
      // easy version of https://github.com/nosir/cleave.js/pull/707/files
      if (pps.numeral && pps.numeralDecimalPadding && pps.numeralDecimalScale > 0) {
        this.result = pps.numeralFormatter.padDecimal(this.element.value);
        this.updateValueState();
      }
    }
  }

  oninput(event) {
    const pps = this.config;

    this.dispatch("beforeinput", {
      event,
    });
    if (pps.onBeforeInput) {
      const res = pps.onBeforeInput(this);

      // You can prevent formatting
      if (res === false) {
        return;
      }
    }

    if (pps.allowedChars) {
      const data = this.element.value;
      if (data) {
        const del = pps.delimiters.slice();
        del.push(pps.delimiter);
        this.element.value = CleaveUtils.filterByRegex(this.element.value, pps.allowedChars, del);
        // Input was prevented when typing, don't process further (paste needs to go trough)
        if (this.element.value != data && event.inputType == "insertText") {
          return;
        }
      }
    }

    if (this.isComposition) {
      this.result = event.target.value;
      this.updateValueState();
      return;
    }

    this.isBackward = this.isBackward || event.inputType === "deleteContentBackward";

    let postDelimiter = CleaveUtils.getPostDelimiter(this.lastInputValue, pps.delimiter, pps.delimiters);

    if (this.isBackward && postDelimiter) {
      pps.postDelimiterBackspace = postDelimiter;
    } else {
      pps.postDelimiterBackspace = false;
    }

    this.formatInput(this.element.value);

    this.dispatch("afterinput", {
      event,
    });
    if (pps.onAfterInput) {
      pps.onAfterInput(this);
    }
  }

  dispatch(name, detail = {}) {
    const bubbles = true;
    this.element.dispatchEvent(
      new CustomEvent("cleave." + name, {
        bubbles,
        detail,
      })
    );
  }

  onfocus() {
    const pps = this.config;
    this.lastInputValue = this.element.value;

    if (pps.prefix && pps.noImmediatePrefix && !this.element.value) {
      this.formatInput(pps.prefix);
    }

    CleaveUtils.fixPrefixCursor(this.element, pps.prefix, pps.delimiter, pps.delimiters, pps.tailPrefix);
  }

  oncut(e) {
    if (!CleaveUtils.checkFullSelection(this.element.value)) return;
    this.copyClipboardData(e);

    // @link https://github.com/nosir/cleave.js/pull/633/commits/65bdb44063cc7b0f3286a386d726fb2e8b5c3699
    if (!this.element.readonly) {
      this.formatInput("");
    }
  }

  oncopy(e) {
    if (!CleaveUtils.checkFullSelection(this.element.value)) return;
    this.copyClipboardData(e);
  }

  copyClipboardData(e) {
    const pps = this.config;
    let inputValue = this.element.value;
    let textToCopy = "";

    if (!pps.copyDelimiter) {
      textToCopy = CleaveUtils.stripDelimiters(inputValue, pps.delimiter, pps.delimiters);
    } else {
      textToCopy = inputValue;
    }

    try {
      if (e.clipboardData) {
        e.clipboardData.setData("Text", textToCopy);
      } else {
        window.clipboardData.setData("Text", textToCopy);
      }

      e.preventDefault();
    } catch (ex) {
      //  empty
    }
  }

  formatInput(value) {
    let pps = this.config;

    // case 1: delete one more character "4"
    // 1234*| -> hit backspace -> 123|
    // case 2: last character is not delimiter which is:
    // 12|34* -> hit backspace -> 1|34*
    // note: no need to apply this for numeral mode
    let postDelimiterAfter = CleaveUtils.getPostDelimiter(value, pps.delimiter, pps.delimiters);
    if (!pps.numeral && pps.postDelimiterBackspace && !postDelimiterAfter) {
      value = CleaveUtils.headStr(value, value.length - pps.postDelimiterBackspace.length);
    }
    // Make sure clearing the whole value is only keeping the prefix
    if (this.isBackward && !value && pps.prefix) {
      value = pps.prefix;
    }

    // numeral formatter
    if (pps.numeral) {
      // Do not show prefix when noImmediatePrefix is specified
      // This mostly because we need to show user the native input placeholder
      if (pps.prefix && pps.noImmediatePrefix && value.length === 0) {
        this.result = "";
      } else {
        this.result = pps.numeralFormatter.format(value);
      }
      this.updateValueState();
      return;
    }

    // date and time
    if (pps.date && pps.time) {
      value = CleaveUtils.getDateTimeValue(value, pps.dateFormatter, pps.timeFormatter, pps.delimiters);
    } else if (pps.date) {
      // only date
      value = pps.dateFormatter.getValidatedDate(value);
    } else if (pps.time) {
      // only time
      value = pps.timeFormatter.getValidatedTime(value);
    }

    // strip delimiters
    value = CleaveUtils.stripDelimiters(value, pps.delimiter, pps.delimiters);

    // strip prefix
    value = CleaveUtils.getPrefixStrippedValue(
      value,
      pps.prefix,
      pps.prefix.length,
      this.result,
      pps.delimiter,
      pps.delimiters,
      pps.noImmediatePrefix,
      pps.tailPrefix,
      pps.signBeforePrefix
    );

    // strip non-numeric characters
    value = pps.numericOnly ? CleaveUtils.strip(value, /[^\d]/g) : value;

    // strip non-hexadecimal characters
    value = pps.hexadecimalOnly ? CleaveUtils.strip(value, /[^0-9a-fA-F]/g) : value;

    // convert case
    value = pps.uppercase ? value.toUpperCase() : value;
    value = pps.lowercase ? value.toLowerCase() : value;
    // @link https://github.com/nosir/cleave.js/pull/623/commits/1f3c0ac5c073004d98d7e523dee2fe27b4b91ff2
    value = pps.ucfirst && value.length > 1 ? value[0].toUpperCase() + value.substring(1).toLowerCase() : value;

    // prevent from showing prefix when no immediate option enabled with empty input value
    if (pps.prefix) {
      if (pps.tailPrefix) {
        value = value + pps.prefix;
      } else {
        value = pps.prefix + value;
      }

      // no blocks specified, no need to do formatting
      if (pps.blocks.length === 0) {
        this.result = value;
        this.updateValueState();
        return;
      }
    }

    // strip over length characters
    value = CleaveUtils.headStr(value, pps.maxLength);

    // apply blocks
    this.result = CleaveUtils.getFormattedValue(value, pps.blocks, pps.blocks.length, pps.delimiter, pps.delimiters, pps.delimiterLazyShow);
    this.updateValueState();
  }

  /**
   * Assign this.result to element value and calls value changed
   * @returns
   */
  updateValueState() {
    const pps = this.config;

    if (!this.element) {
      return;
    }

    let endPos = this.element.selectionEnd;
    let oldValue = "" + this.element.value;
    let newValue = this.result;

    const doc = this.element.ownerDocument;

    endPos = CleaveUtils.getNextCursorPosition(endPos, oldValue, newValue, pps.delimiter, pps.delimiters);
    if (pps.tailPrefix && endPos >= oldValue.length) {
      endPos -= pps.prefix.length;
    }

    this.element.value = newValue;
    if (pps.swapHiddenInput) {
      this.elementSwapHidden.value = this.getRawValue();
    }
    CleaveUtils.setSelection(this.element, endPos, doc, false);

    this.dispatch("valuechanged", {
      oldValue,
      newValue,
    });
    if (this.config.onValueChanged) {
      this.config.onValueChanged(this);
    }
  }

  setRawValue(value) {
    const pps = this.config;

    value = value !== undefined && value !== null ? value.toString() : "";

    if (pps.numeral) {
      value = value.replace(".", pps.numeralDecimalMark);

      if (pps.numeralDecimalPadding) {
        value = pps.numeralFormatter.padDecimal(value);
      }
    }

    pps.postDelimiterBackspace = false;

    this.element.value = value;
    this.formatInput(value);
  }

  /**
   * @param {Boolean} trimPrefix
   * @returns {String}
   */
  getRawValue(trimPrefix = false) {
    const pps = this.config;
    let rawValue = this.element.value;

    if (pps.rawValueTrimPrefix || trimPrefix) {
      rawValue = CleaveUtils.getPrefixStrippedValue(
        rawValue,
        pps.prefix,
        pps.prefix.length,
        this.result,
        pps.delimiter,
        pps.delimiters,
        pps.noImmediatePrefix,
        pps.tailPrefix,
        pps.signBeforePrefix
      );
    }

    if (pps.numeral) {
      rawValue = pps.numeralFormatter.getRawValue(rawValue);
    } else {
      rawValue = CleaveUtils.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
    }

    return rawValue;
  }

  getISOFormatDate() {
    const pps = this.config;
    return pps.date ? pps.dateFormatter.getISOFormatDate() : "";
  }

  getISOFormatTime() {
    const pps = this.config;
    return pps.time ? pps.timeFormatter.getISOFormatTime() : "";
  }

  getISOFormatDateTime() {
    const pps = this.config;

    if (pps.date) {
      const date = this.getISOFormatDate();
      const time = this.getISOFormatTime() || "00:00:00";
      return `${date}T${time}`;
    }

    return "";
  }

  getFormattedValue() {
    return this.element.value;
  }

  destroy() {
    events.forEach((type) => {
      this.element.removeEventListener(type, this);
    });
    instances.delete(this.element);
  }

  toString() {
    return "[Cleave Object]";
  }
}

export default Cleave;
