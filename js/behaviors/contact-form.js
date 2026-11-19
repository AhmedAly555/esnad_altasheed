import { $, $$ } from "../lib/dom.js";
import { fieldProblem } from "../lib/validation.js";

const MESSAGE_ATTRIBUTE = { required: "errorRequired", invalid: "errorInvalid" };
const TRAP_FIELD = "_gotcha";

function showProblem(field, problem) {
  const error = $(`#${field.id}-error`);
  error.textContent = problem ? field.dataset[MESSAGE_ATTRIBUTE[problem]] : "";
  error.hidden = !problem;
  field.setAttribute("aria-invalid", String(Boolean(problem)));
}

function preselectProjectType(select) {
  const wanted = new URLSearchParams(location.search).get("type");
  if (wanted && [...select.options].some((option) => option.value === wanted)) select.value = wanted;
}

/**
 * Contact form: inline validation with messages tied to each field (aria-describedby), a posted
 * submission to the endpoint in the form's action, and a success or failure panel afterwards.
 * Without JS the browser posts the form to the same endpoint.
 */
export function init() {
  const root = $("[data-contact]");
  const form = root && $("[data-contact-form]", root);
  if (!form) return;

  const fields = $$("input, select, textarea", form).filter((field) => field.name !== TRAP_FIELD);
  const submit = $("[data-submit]", form);
  const statuses = Object.fromEntries($$("[data-status]", root).map((panel) => [panel.dataset.status, panel]));
  const idleLabel = submit.textContent;

  preselectProjectType(form.elements.project_type);

  const check = (field) => {
    const problem = fieldProblem(field);
    showProblem(field, problem);
    return problem;
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => check(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") check(field);
    });
  });

  function reveal(name) {
    Object.values(statuses).forEach((panel) => {
      panel.hidden = panel.dataset.status !== name;
    });
    if (name === "success") form.hidden = true;
    statuses[name]?.focus();
  }

  async function send() {
    submit.disabled = true;
    submit.textContent = submit.dataset.labelSending;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      reveal(response.ok ? "success" : "failure");
    } catch {
      reveal("failure");
    } finally {
      submit.disabled = false;
      submit.textContent = idleLabel;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    Object.values(statuses).forEach((panel) => {
      panel.hidden = true;
    });
    const firstInvalid = fields.filter((field) => check(field)).at(0);
    if (firstInvalid) firstInvalid.focus();
    else send();
  });
}
