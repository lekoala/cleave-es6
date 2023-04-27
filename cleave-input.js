import Cleave from "./src/Cleave.js";

// Example
/*
<label for="date-input" class="form-label">Date</label>
<cleave-input type="date">
    <input type="text" class="form-control" id="date-input" name="date">
</cleave-input>
*/

let counter = 0;

class CleaveInput extends HTMLElement {
  connectedCallback() {
    counter++;

    // make sure it's parsed
    setTimeout(() => {
      this.init();
    });
  }

  init() {
    let c = {};
    const dataConfig = this.dataset.config;
    if (dataConfig) {
      c = Object.assign(c, JSON.parse(dataConfig));
    }

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
    this.cleave.destroy();
  }

  /**
   * @returns {Cleave}
   */
  getCleave() {
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
