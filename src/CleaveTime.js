class CleaveTime {
  constructor(timePattern, timeFormat) {
    this.time = [];
    this.blocks = [];
    this.timePattern = timePattern;
    this.timeFormat = timeFormat;
    this.initBlocks();
  }

  initBlocks() {
    this.timePattern.forEach(() => {
      this.blocks.push(2);
    });
  }

  getISOFormatTime() {
    let time = this.time;

    return time[2] ? this.addLeadingZero(time[0]) + ":" + this.addLeadingZero(time[1]) + ":" + this.addLeadingZero(time[2]) : "";
  }

  getBlocks() {
    return this.blocks;
  }

  getTimeFormatOptions() {
    if (String(this.timeFormat) === "12") {
      return {
        maxHourFirstDigit: 1,
        maxHours: 12,
        maxMinutesFirstDigit: 5,
        maxMinutes: 60,
      };
    }

    return {
      maxHourFirstDigit: 2,
      maxHours: 23,
      maxMinutesFirstDigit: 5,
      maxMinutes: 60,
    };
  }

  getValidatedTime(value) {
    let result = "";

    value = value.replace(/[^\d]/g, "");

    let timeFormatOptions = this.getTimeFormatOptions();

    this.blocks.forEach((length, index) => {
      if (value.length > 0) {
        let sub = value.slice(0, length),
          sub0 = sub.slice(0, 1),
          rest = value.slice(length);

        switch (this.timePattern[index]) {
          case "h":
            if (parseInt(sub0, 10) > timeFormatOptions.maxHourFirstDigit) {
              sub = "0" + sub0;
            } else if (parseInt(sub, 10) > timeFormatOptions.maxHours) {
              sub = timeFormatOptions.maxHours + "";
            }

            break;

          case "m":
          case "s":
            if (parseInt(sub0, 10) > timeFormatOptions.maxMinutesFirstDigit) {
              sub = "0" + sub0;
            } else if (parseInt(sub, 10) > timeFormatOptions.maxMinutes) {
              sub = timeFormatOptions.maxMinutes + "";
            }
            break;
        }

        result += sub;

        // update remaining string
        value = rest;
      }
    });

    return this.getFixedTimeString(result);
  }

  getFixedTimeString(value) {
    let timePattern = this.timePattern,
      time = [],
      secondIndex = 0,
      minuteIndex = 0,
      hourIndex = 0,
      secondStartIndex = 0,
      minuteStartIndex = 0,
      hourStartIndex = 0,
      second,
      minute,
      hour;

    if (value.length === 6) {
      timePattern.forEach((type, index) => {
        switch (type) {
          case "s":
            secondIndex = index * 2;
            break;
          case "m":
            minuteIndex = index * 2;
            break;
          case "h":
            hourIndex = index * 2;
            break;
        }
      });

      hourStartIndex = hourIndex;
      minuteStartIndex = minuteIndex;
      secondStartIndex = secondIndex;

      second = parseInt(value.slice(secondStartIndex, secondStartIndex + 2), 10);
      minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
      hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

      time = this.getFixedTime(hour, minute, second);
    }

    if (value.length === 4 && this.timePattern.indexOf("s") < 0) {
      timePattern.forEach((type, index) => {
        switch (type) {
          case "m":
            minuteIndex = index * 2;
            break;
          case "h":
            hourIndex = index * 2;
            break;
        }
      });

      hourStartIndex = hourIndex;
      minuteStartIndex = minuteIndex;

      second = 0;
      minute = parseInt(value.slice(minuteStartIndex, minuteStartIndex + 2), 10);
      hour = parseInt(value.slice(hourStartIndex, hourStartIndex + 2), 10);

      time = this.getFixedTime(hour, minute, second);
    }

    this.time = time;

    return time.length === 0
      ? value
      : timePattern.reduce((previous, current) => {
          switch (current) {
            case "s":
              return previous + this.addLeadingZero(time[2]);
            case "m":
              return previous + this.addLeadingZero(time[1]);
            case "h":
              return previous + this.addLeadingZero(time[0]);
          }
        }, "");
  }

  getFixedTime(hour, minute, second) {
    second = Math.min(parseInt(second || 0, 10), 60);
    minute = Math.min(minute, 60);
    hour = Math.min(hour, 60);

    return [hour, minute, second];
  }

  addLeadingZero(number) {
    return (number < 10 ? "0" : "") + number;
  }
}

export default CleaveTime;
