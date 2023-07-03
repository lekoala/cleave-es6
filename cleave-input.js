import Cleave from "./src/Cleave.js";

// Example
/*
<label for="date-input" class="form-label">Date</label>
<cleave-input type="date">
    <input type="text" class="form-control" id="date-input" name="date">
</cleave-input>
*/

let counter = 0;

function getGlobalFn(fn) {
  return fn.split(".").reduce((r, p) => r[p], window);
}

class CleaveInput extends HTMLElement {
  connectedCallback() {
    counter++;

    // make sure it's parsed
    setTimeout(() => {
      this.init();
    });
  }

  init() {
    // If we reinitialize, destroy current instance
    if (this.cleave) {
      this.cleave.destroy();
    }

    let c = {};
    const dataConfig = this.dataset.config;
    if (dataConfig) {
      c = Object.assign(c, JSON.parse(dataConfig));
    }

    const fnNames = ["onValueChanged", "onBeforeInput", "onAfterInput"];
    fnNames.forEach((fnName) => {
      if (typeof c[fnName] == "string") {
        c[fnName] = getGlobalFn(c[fnName]);
      }
    });

    const input = this.getInput();
    const id = input.getAttribute("id") || `cleave-input-${counter}`;
    input.setAttribute("id", id);

    const type = this.getAttribute("type") || null;
    if (type) {
      if (type === "datetime") {
        c.date = true;
        c.time = true;
      } else {
        c[type] = true;
      }
    }

    this.cleave = new Cleave(input, c);
  }

  disconnectedCallback() {
    // This may be disconnected before it's created
    if (this.cleave) {
      this.cleave.destroy();
    }
  }

  /**
   * @returns {Cleave}
   */
  getCleave() {
    if (!this.cleave) {
      throw Error("Cleave is not initialized yet");
    }
    return this.cleave;
  }

  /**
   * @returns {HTMLInputElement}
   */
  getInput() {
    return this.querySelector("input");
  }
}

customElements.define("cleave-input", CleaveInput);

export default CleaveInput;
