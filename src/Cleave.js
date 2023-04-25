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
 * @property {Function} onValueChanged
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
  onValueChanged: () => {},
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

    if (this.isDate()) {
      this.config.numericOnly = true;
    }

    this.initValue = el.value;
    this.element = el;

    instances.set(el, this);

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
   * @param {Event} event
   */
  handleEvent(event) {
    if (events.includes(event.type)) {
      // Should really not happen, except if this is rebound by some external script
      const target = this instanceof Cleave ? this : Cleave.getInstance(event.target);
      target[`on${event.type}`](event);
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
    this.config.maxLength = CleaveUtils.getMaxLength(this.config.blocks);

    this.isAndroid = CleaveUtils.isAndroid();
    this.lastInputValue = "";
    this.isBackward = "";
    //@link https://github.com/nosir/cleave.js/pull/663/commits/af08e17c0138ad1eb522f8e3addf70abed7dc5b9
    this.isComposition = false;

    this.initSwapHiddenInput();

    events.forEach((type) => {
      this.element.addEventListener(type, this);
    });

    this.initDateFormatter();
    this.initTimeFormatter();
    this.initNumeralFormatter();

    // avoid touch input field if value is null
    // otherwise Firefox will add red box-shadow for <input required />
    if (this.initValue || (this.config.prefix && !this.config.noImmediatePrefix)) {
      this.formatInput(this.initValue);
    }
  }

  initSwapHiddenInput() {
    if (!this.config.swapHiddenInput) {
      return;
    }

    const inputFormatter = this.element.cloneNode(true);
    this.element.parentNode.insertBefore(inputFormatter, this.element);

    this.elementSwapHidden = this.element;
    this.elementSwapHidden.type = "hidden";

    this.element = inputFormatter;
    this.element.id = "";
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
    let value = parseFloat(this.getRawValue());

    // numeral formatter
    // @link https://github.com/nosir/cleave.js/pull/660/commits/c0a3359905ce4b72530d51cab0e71d22b0c6c601
    if (
      pps.numeral &&
      this.element.value.length > 0 &&
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

  oninput(event) {
    const pps = this.config;

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
  }

  onfocus() {
    const pps = this.config;
    this.lastInputValue = this.element.value;

    if (pps.prefix && pps.noImmediatePrefix && !this.element.value) {
      this.formatInput(pps.prefix);
    }

    CleaveUtils.fixPrefixCursor(this.element, pps.prefix, pps.delimiter, pps.delimiters);
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

  updateValueState() {
    const pps = this.config;

    if (!this.element) {
      return;
    }

    let endPos = this.element.selectionEnd;
    let oldValue = this.element.value;
    let newValue = this.result;

    const doc = this.element.ownerDocument;

    endPos = CleaveUtils.getNextCursorPosition(endPos, oldValue, newValue, pps.delimiter, pps.delimiters);

    // fix Android browser type="text" input field
    // cursor not jumping issue
    if (this.isAndroid) {
      window.setTimeout(() => {
        this.element.value = newValue;
        CleaveUtils.setSelection(this.element, endPos, doc, false);
        this.config.onValueChanged(this);
      }, 1);

      return;
    }

    this.element.value = newValue;
    if (pps.swapHiddenInput) {
      this.elementSwapHidden.value = this.getRawValue();
    }

    CleaveUtils.setSelection(this.element, endPos, doc, false);
    this.config.onValueChanged(this);
  }

  setRawValue(value) {
    const pps = this.config;

    value = value !== undefined && value !== null ? value.toString() : "";

    if (pps.numeral) {
      value = value.replace(".", pps.numeralDecimalMark);
    }

    pps.postDelimiterBackspace = false;

    this.element.value = value;
    this.formatInput(value);
  }

  getRawValue() {
    const pps = this.config;
    let rawValue = this.element.value;

    if (pps.rawValueTrimPrefix) {
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
  }

  toString() {
    return "[Cleave Object]";
  }
}

export default Cleave;
