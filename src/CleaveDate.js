class CleaveDate {
  constructor(datePattern, dateMin, dateMax) {
    this.date = [];
    this.blocks = [];
    this.datePattern = datePattern;
    this.dateMin = dateMin
      .split("-")
      .reverse()
      .map((x) => {
        return parseInt(x, 10);
      });
    if (this.dateMin.length === 2) this.dateMin.unshift(0);

    this.dateMax = dateMax
      .split("-")
      .reverse()
      .map((x) => {
        return parseInt(x, 10);
      });
    if (this.dateMax.length === 2) this.dateMax.unshift(0);

    this.initBlocks();
  }

  initBlocks() {
    this.datePattern.forEach((value) => {
      if (value === "Y") {
        this.blocks.push(4);
      } else {
        this.blocks.push(2);
      }
    });
  }

  getISOFormatDate() {
    let date = this.date;
    return date[2] ? date[2] + "-" + this.addLeadingZero(date[1]) + "-" + this.addLeadingZero(date[0]) : "";
  }

  getBlocks() {
    return this.blocks;
  }

  getMaxStringLength() {
    return this.getBlocks().reduce(function (a, b) {
      return a + b;
    }, 0);
  }

  getValidatedDate(value) {
    let result = "";
    value = value.replace(/[^\d]/g, "");

    this.blocks.forEach((length, index) => {
      if (value.length > 0) {
        let sub = value.slice(0, length),
          sub0 = sub.slice(0, 1),
          rest = value.slice(length);

        switch (this.datePattern[index]) {
          case "d":
            if (sub === "00") {
              sub = "01";
            } else if (parseInt(sub0, 10) > 3) {
              sub = "0" + sub0;
            } else if (parseInt(sub, 10) > 31) {
              sub = "31";
            }

            break;

          case "m":
            if (sub === "00") {
              sub = "01";
            } else if (parseInt(sub0, 10) > 1) {
              sub = "0" + sub0;
            } else if (parseInt(sub, 10) > 12) {
              sub = "12";
            }

            break;
        }

        result += sub;

        // update remaining string
        value = rest;
      }
    });

    return this.getFixedDateString(result);
  }

  getFixedDateString(value) {
    let datePattern = this.datePattern,
      date = [],
      dayIndex = 0,
      monthIndex = 0,
      yearIndex = 0,
      dayStartIndex = 0,
      monthStartIndex = 0,
      yearStartIndex = 0,
      day,
      month,
      year,
      fullYearDone = false;

    // mm-dd || dd-mm
    if (value.length === 4 && datePattern[0].toLowerCase() !== "y" && datePattern[1].toLowerCase() !== "y") {
      dayStartIndex = datePattern[0] === "d" ? 0 : 2;
      monthStartIndex = 2 - dayStartIndex;
      day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
      month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);

      date = this.getFixedDate(day, month, 0);
    }

    // yyyy-mm-dd || yyyy-dd-mm || mm-dd-yyyy || dd-mm-yyyy || dd-yyyy-mm || mm-yyyy-dd
    if (value.length === 8) {
      datePattern.forEach((type, index) => {
        switch (type) {
          case "d":
            dayIndex = index;
            break;
          case "m":
            monthIndex = index;
            break;
          default:
            yearIndex = index;
            break;
        }
      });

      yearStartIndex = yearIndex * 2;
      dayStartIndex = dayIndex <= yearIndex ? dayIndex * 2 : dayIndex * 2 + 2;
      monthStartIndex = monthIndex <= yearIndex ? monthIndex * 2 : monthIndex * 2 + 2;

      day = parseInt(value.slice(dayStartIndex, dayStartIndex + 2), 10);
      month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
      year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

      fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

      date = this.getFixedDate(day, month, year);
    }

    // mm-yy || yy-mm
    if (value.length === 4 && (datePattern[0] === "y" || datePattern[1] === "y")) {
      monthStartIndex = datePattern[0] === "m" ? 0 : 2;
      yearStartIndex = 2 - monthStartIndex;
      month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
      year = parseInt(value.slice(yearStartIndex, yearStartIndex + 2), 10);

      fullYearDone = value.slice(yearStartIndex, yearStartIndex + 2).length === 2;

      date = [0, month, year];
    }

    // mm-yyyy || yyyy-mm
    if (value.length === 6 && (datePattern[0] === "Y" || datePattern[1] === "Y")) {
      monthStartIndex = datePattern[0] === "m" ? 0 : 4;
      yearStartIndex = 2 - 0.5 * monthStartIndex;
      month = parseInt(value.slice(monthStartIndex, monthStartIndex + 2), 10);
      year = parseInt(value.slice(yearStartIndex, yearStartIndex + 4), 10);

      fullYearDone = value.slice(yearStartIndex, yearStartIndex + 4).length === 4;

      date = [0, month, year];
    }

    date = this.getRangeFixedDate(date);
    this.date = date;

    let result =
      date.length === 0
        ? value
        : datePattern.reduce((previous, current) => {
            switch (current) {
              case "d":
                return previous + (date[0] === 0 ? "" : this.addLeadingZero(date[0]));
              case "m":
                return previous + (date[1] === 0 ? "" : this.addLeadingZero(date[1]));
              case "y":
                return previous + (fullYearDone ? this.addLeadingZeroForYear(date[2], false) : "");
              case "Y":
                return previous + (fullYearDone ? this.addLeadingZeroForYear(date[2], true) : "");
            }
          }, "");

    return result;
  }

  getRangeFixedDate(date) {
    let datePattern = this.datePattern,
      dateMin = this.dateMin || [],
      dateMax = this.dateMax || [];

    if (!date.length || (dateMin.length < 3 && dateMax.length < 3)) return date;

    if (
      datePattern.find((x) => {
        return x.toLowerCase() === "y";
      }) &&
      date[2] === 0
    )
      return date;

    if (
      dateMax.length &&
      (dateMax[2] < date[2] || (dateMax[2] === date[2] && (dateMax[1] < date[1] || (dateMax[1] === date[1] && dateMax[0] < date[0]))))
    )
      return dateMax;

    if (
      dateMin.length &&
      (dateMin[2] > date[2] || (dateMin[2] === date[2] && (dateMin[1] > date[1] || (dateMin[1] === date[1] && dateMin[0] > date[0]))))
    )
      return dateMin;

    return date;
  }

  getFixedDate(day, month, year) {
    day = Math.min(day, 31);
    month = Math.min(month, 12);
    year = parseInt(year || 0, 10);

    if ((month < 7 && month % 2 === 0) || (month > 8 && month % 2 === 1)) {
      day = Math.min(day, month === 2 ? (this.isLeapYear(year) ? 29 : 28) : 30);
    }

    return [day, month, year];
  }

  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  addLeadingZero(number) {
    return (number < 10 ? "0" : "") + number;
  }

  addLeadingZeroForYear(number, fullYearMode) {
    if (fullYearMode) {
      return (number < 10 ? "000" : number < 100 ? "00" : number < 1000 ? "0" : "") + number;
    }

    return (number < 10 ? "0" : "") + number;
  }
}

export default CleaveDate;
