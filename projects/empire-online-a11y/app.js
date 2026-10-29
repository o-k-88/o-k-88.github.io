/* Browser UI for Empire Online A11y. Mirrors brightspace_a11y_checker/ui.py. */
"use strict";

const $ = (id) => document.getElementById(id);

/* ---------- Worker messaging ---------- */

const worker = new Worker("worker.js");
const pending = new Map();
let nextRequestId = 1;

worker.onmessage = (event) => {
  const message = event.data;
  if (message.type === "ready") {
    onEngineReady(message.info);
    return;
  }
  if (message.type === "fatal") {
    onEngineFailed(message.error);
    return;
  }
  const request = pending.get(message.id);
  if (!request) {
    return;
  }
  pending.delete(message.id);
  if (message.ok) {
    request.resolve(message.result);
  } else {
    request.reject(new Error(message.error));
  }
};

worker.onerror = (event) => {
  onEngineFailed(event.message || "The scan engine could not start.");
};

function request(type, payload) {
  return new Promise((resolve, reject) => {
    const id = nextRequestId++;
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, type, payload });
  });
}

function onEngineReady(info) {
  const status = $("engine-status");
  status.dataset.state = "ready";
  status.textContent = `Scan engine ready (version ${info.version}).`;
  const list = $("checks-list");
  list.replaceChildren(
    ...info.checklist.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    })
  );
}

function onEngineFailed(message) {
  const status = $("engine-status");
  status.dataset.state = "error";
  status.textContent = `The scan engine could not load: ${message} Reload the page to try again. If this keeps happening, confirm the whole dist folder, including the pyodide folder, was uploaded.`;
  for (const request of pending.values()) {
    request.reject(new Error(message));
  }
  pending.clear();
}

/* ---------- Tabs (WAI-ARIA tabs pattern, automatic activation) ---------- */

const tabs = Array.from(document.querySelectorAll('[role="tab"]'));

function selectTab(tab, focus = true) {
  for (const other of tabs) {
    const selected = other === tab;
    other.setAttribute("aria-selected", String(selected));
    other.tabIndex = selected ? 0 : -1;
    $(other.getAttribute("aria-controls")).hidden = !selected;
  }
  if (focus) {
    tab.focus();
  }
}

for (const tab of tabs) {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(tab);
    let target = null;
    if (event.key === "ArrowRight") target = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") target = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === "Home") target = tabs[0];
    if (event.key === "End") target = tabs[tabs.length - 1];
    if (target) {
      event.preventDefault();
      selectTab(target);
    }
  });
}

/* ---------- Shared helpers ---------- */

function setStatus(element, text, state = "") {
  element.textContent = text;
  if (state) {
    element.dataset.state = state;
  } else {
    delete element.dataset.state;
  }
}

function showFieldError(input, errorElement, message) {
  errorElement.textContent = message;
  errorElement.hidden = false;
  input.setAttribute("aria-invalid", "true");
  input.focus();
}

function clearFieldError(input, errorElement) {
  errorElement.textContent = "";
  errorElement.hidden = true;
  input.removeAttribute("aria-invalid");
}

/* Keeps the newest report available through a Blob URL for opening and downloading. */
function createReportSlot(openButton, downloadLink) {
  let url = null;
  let filename = "";
  openButton.addEventListener("click", () => {
    if (url) {
      window.open(url, "_blank", "noopener");
    }
  });
  return {
    set(html, name) {
      this.clear();
      url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      filename = name;
      openButton.disabled = false;
      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.hidden = false;
    },
    clear() {
      if (url) {
        URL.revokeObjectURL(url);
      }
      url = null;
      openButton.disabled = true;
      downloadLink.hidden = true;
      downloadLink.removeAttribute("href");
    },
  };
}

function courseIdFromExportName(filename) {
  // Same pattern as cartridge.course_id_from_export_name.
  const stem = filename.replace(/\.[^.]+$/, "");
  const match = stem.match(/D2L(?:CC)?Export[_-](\d+)/i);
  return match ? match[1] : "";
}

/* ---------- Accessibility Scan ---------- */

const primaryInput = $("primary-file");
const introInput = $("intro-file");
const courseInput = $("course-id");
const scanStatus = $("scan-status");
const scanButton = $("scan-button");
const checkFiles = $("check-files");
const reportScope = $("report-scope");
const scanReport = createReportSlot($("open-report"), $("download-report"));

primaryInput.addEventListener("change", () => {
  clearFieldError(primaryInput, $("primary-file-error"));
  const file = primaryInput.files[0];
  if (!file) {
    return;
  }
  const detected = courseIdFromExportName(file.name);
  if (detected && !courseInput.value.trim()) {
    courseInput.value = detected;
    setStatus(scanStatus, `Ready to scan:\n${file.name}\n\nDetected Brightspace course ID ${detected} from the cartridge filename.`);
  } else {
    setStatus(scanStatus, `Ready to scan:\n${file.name}`);
  }
  quizStatusIdle();
});

introInput.addEventListener("change", () => {
  const file = introInput.files[0];
  if (!file) {
    return;
  }
  const primary = primaryInput.files[0];
  const message = primary
    ? `Ready to scan primary export:\n${primary.name}\n\nAnd module intros from:\n${file.name}`
    : `Ready to scan module intros from:\n${file.name}`;
  setStatus(scanStatus, message);
});

checkFiles.addEventListener("change", () => {
  reportScope.disabled = !checkFiles.checked;
  if (!checkFiles.checked) {
    $("scope-combined").checked = true;
  }
});

function isExportFile(file, extensions) {
  return extensions.some((extension) => file.name.toLowerCase().endsWith(extension));
}

$("scan-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const primary = primaryInput.files[0];
  const primaryError = $("primary-file-error");
  if (!primary || !isExportFile(primary, [".imscc", ".zip"])) {
    showFieldError(primaryInput, primaryError, "Please choose a valid .imscc or D2LExport .zip file.");
    return;
  }
  clearFieldError(primaryInput, primaryError);
  const intro = introInput.files[0] || null;

  const includeFiles = checkFiles.checked;
  const filesOnly = includeFiles && $("scope-files").checked;
  let message = "Scanning export. This may take a few minutes for large courses...";
  if (filesOnly) {
    message = "Checking course files for unattached, duplicate, and large files...";
  }
  setStatus(scanStatus, message);
  scanButton.disabled = true;
  scanReport.clear();

  try {
    const result = await request("scan", {
      primary,
      intro,
      courseId: courseInput.value,
      skipHidden: $("skip-hidden").checked,
      customTerms: $("custom-terms").value,
      includeFiles,
      filesOnly,
    });
    scanReport.set(result.html, result.filename);
    setStatus(scanStatus, `Scan complete.\n\nFindings: ${result.count}\nReport: ${result.filename}\n\nSelect Open Report to view it, or Download Report to save a copy.`);
  } catch (error) {
    setStatus(scanStatus, `Scan failed. ${error.message}`, "error");
  } finally {
    scanButton.disabled = false;
  }
});

/* ---------- Quick Check ---------- */

const quickHtml = $("quick-html");
const quickStatus = $("quick-status");
const quickButton = $("quick-button");
const quickReport = createReportSlot($("quick-open"), $("quick-download"));
const QUICK_IDLE = "Paste an HTML page above, then select Check Pasted HTML.";

$("quick-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const markup = quickHtml.value.trim();
  const errorElement = $("quick-html-error");
  if (!markup) {
    showFieldError(quickHtml, errorElement, "Paste the raw HTML for one page before running Quick Check.");
    return;
  }
  if (!markup.includes("<") || !markup.includes(">")) {
    showFieldError(quickHtml, errorElement, "The pasted content does not appear to contain HTML tags.");
    return;
  }
  clearFieldError(quickHtml, errorElement);
  quickButton.disabled = true;
  quickReport.clear();
  setStatus(quickStatus, "Checking the pasted HTML...");
  try {
    const result = await request("quick", { markup });
    quickReport.set(result.html, result.filename);
    setStatus(quickStatus, `Quick Check complete. Findings: ${result.count}\nReport: ${result.filename}`);
  } catch (error) {
    setStatus(quickStatus, `Quick Check failed. ${error.message}`, "error");
  } finally {
    quickButton.disabled = false;
  }
});

$("quick-clear").addEventListener("click", () => {
  quickHtml.value = "";
  quickReport.clear();
  clearFieldError(quickHtml, $("quick-html-error"));
  setStatus(quickStatus, QUICK_IDLE);
  quickHtml.focus();
});

/* ---------- Quiz Library ---------- */

const quizStatus = $("quiz-status");
const quizRows = $("quiz-rows");
const quizSearch = $("quiz-search");
const quizLoadButton = $("quiz-load");
const quizDialog = $("quiz-dialog");
let quizRecords = [];
let visibleQuizRecords = [];
let reviewIndex = 0;
let reviewOpener = null;

function quizStatusIdle() {
  if (!quizRecords.length) {
    setStatus(quizStatus, "Choose an export on the Accessibility Scan tab, then load the quiz library.");
  }
}

quizLoadButton.addEventListener("click", async () => {
  const primary = primaryInput.files[0];
  if (!primary || !isExportFile(primary, [".imscc", ".zip"])) {
    setStatus(quizStatus, "Choose a valid export on the Accessibility Scan tab first.", "error");
    return;
  }
  quizLoadButton.disabled = true;
  setStatus(quizStatus, "Loading quiz library...");
  try {
    const result = await request("quiz", { primary, skipHidden: $("skip-hidden").checked });
    quizRecords = result.records;
    renderQuizRecords();
    setStatus(quizStatus, `Loaded ${quizRecords.length} question(s). ${visibleSummary()}`);
  } catch (error) {
    setStatus(quizStatus, `Quiz library load failed. ${error.message}`, "error");
  } finally {
    quizLoadButton.disabled = false;
  }
});

let searchTimer = null;
quizSearch.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    renderQuizRecords();
    setStatus(quizStatus, visibleSummary());
  }, 200);
});

function visibleSummary() {
  const total = quizRecords.length;
  return total ? `Showing ${visibleQuizRecords.length} of ${total} question(s).` : "No quiz questions loaded.";
}

function renderQuizRecords() {
  const query = quizSearch.value.trim().toLowerCase();
  visibleQuizRecords = quizRecords.filter((record) => {
    if (!query) return true;
    const haystack = [record.folder, record.associated_quiz, record.question_text, record.source_file, record.answer_choices.join(" ")]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  if (!visibleQuizRecords.length) {
    const row = document.createElement("tr");
    row.className = "empty";
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = quizRecords.length ? "No questions match the search." : "No quiz questions loaded.";
    row.append(cell);
    quizRows.replaceChildren(row);
    return;
  }

  const fragment = document.createDocumentFragment();
  visibleQuizRecords.forEach((record, index) => {
    const row = document.createElement("tr");
    for (const [value, className] of [
      [record.folder, ""],
      [record.associated_quiz, ""],
      [record.question_text, "question"],
      [record.source_file, ""],
    ]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (className) cell.className = className;
      row.append(cell);
    }
    const actions = document.createElement("td");
    actions.className = "actions-cell";
    const review = document.createElement("button");
    review.type = "button";
    review.textContent = "Review";
    review.setAttribute("aria-label", `Review question ${index + 1}: ${truncate(record.question_text, 60)}`);
    review.addEventListener("click", () => openReview(index, review));
    actions.append(review);
    row.append(actions);
    row.addEventListener("dblclick", () => openReview(index, review));
    fragment.append(row);
  });
  quizRows.replaceChildren(fragment);
}

function truncate(text, length) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function openReview(index, opener) {
  reviewIndex = index;
  reviewOpener = opener;
  showReviewQuestion();
  if (!quizDialog.open) {
    quizDialog.showModal();
  }
  $("quiz-close").focus();
}

function showReviewQuestion() {
  reviewIndex = Math.max(0, Math.min(reviewIndex, visibleQuizRecords.length - 1));
  const record = visibleQuizRecords[reviewIndex];
  $("quiz-dialog-position").textContent = `Question ${reviewIndex + 1} of ${visibleQuizRecords.length}`;

  const body = $("quiz-dialog-body");
  body.replaceChildren();
  const addSection = (heading, content) => {
    const h = document.createElement("h3");
    h.textContent = heading;
    body.append(h, content);
  };
  const paragraph = (text) => {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  };

  addSection("Question Library Folder/Section", paragraph(record.folder));
  addSection("Associated Quiz or Survey", paragraph(record.associated_quiz));
  addSection("Source File", paragraph(record.source_file));
  addSection("Question Text", paragraph(record.question_text));

  if (record.answer_choices.length) {
    const list = document.createElement("ul");
    const correct = new Set(record.correct_answer_choices);
    for (const choice of record.answer_choices) {
      const li = document.createElement("li");
      if (correct.has(choice)) {
        li.className = "correct";
        li.textContent = `* ${choice} `;
        const label = document.createElement("span");
        label.className = "visually-hidden";
        label.textContent = "(correct answer)";
        li.append(label);
      } else {
        li.textContent = choice;
      }
      list.append(li);
    }
    addSection("Answer Choices", list);
    if (correct.size) {
      body.append(paragraph("* marks a correct answer from the export's answer key."));
    }
  } else {
    addSection("Answer Choices", paragraph("No answer choices found in export."));
  }

  $("quiz-prev").disabled = reviewIndex <= 0;
  $("quiz-next").disabled = reviewIndex >= visibleQuizRecords.length - 1;
}

$("quiz-prev").addEventListener("click", () => {
  reviewIndex -= 1;
  showReviewQuestion();
  if ($("quiz-prev").disabled) $("quiz-next").focus();
});

$("quiz-next").addEventListener("click", () => {
  reviewIndex += 1;
  showReviewQuestion();
  if ($("quiz-next").disabled) $("quiz-prev").focus();
});

$("quiz-close").addEventListener("click", () => quizDialog.close());

quizDialog.addEventListener("close", () => {
  // Return focus to the row that was last reviewed, falling back to the original opener.
  const current = quizRows.querySelectorAll("button")[reviewIndex];
  const target = current || reviewOpener;
  if (target && target.isConnected) {
    target.focus();
  }
});
