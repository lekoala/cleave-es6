import test from "ava";
import CleaveInput from "../../cleave-input.js";

test("custom element is registered", (t) => {
  let inst = customElements.get("cleave-input");
  t.is(inst, CleaveInput);
});

test("custom element works as expected", (t) => {
  var el = document.createElement("div");
  el.innerHTML = `<label for="date-input" class="form-label">Date</label>
      <cleave-input type="date">
          <input type="text" class="form-control" id="date-input" name="date">
      </cleave-input>`;
  const cEl = el.querySelector("cleave-input");
  const input = el.querySelector("input");
  t.true(cEl instanceof CleaveInput);
  t.true(cEl.getInput() === input);
});

test("custom element set an id", (t) => {
  var el = document.createElement("div");
  el.innerHTML = `<label for="date-input" class="form-label">Date</label>
      <cleave-input type="date">
          <input type="text" class="form-control" name="date">
      </cleave-input>`;

  // connectedCallback is not being called by test suite
  const cEl = el.querySelector("cleave-input");
  cEl.connectedCallback();

  const input = el.querySelector("input");
  t.true(input.hasAttribute("id"));
});
