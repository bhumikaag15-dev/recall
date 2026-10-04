const editor = document.getElementById("editor");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const undoVisual = document.getElementById("undoVisual");
const redoVisual = document.getElementById("redoVisual");
const versionsEl = document.getElementById("versions");
const toastEl = document.getElementById("toast");

let current = "My Data Structures Assignment\n\nA stack is a linear data structure that follows the LIFO principle: Last In, First Out.\n\nCommon stack operations include push, pop, and peek.";
let undoStates = [];
let redoStates = [];
let versions = [{text: current, label: "Document created", time: new Date()}];
let toastTimer;

editor.value = current;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function updateCounts() {
  const words = editor.value.trim() ? editor.value.trim().split(/\s+/).length : 0;
  document.getElementById("wordCount").textContent = words + (words === 1 ? " word" : " words");
  document.getElementById("charCount").textContent = editor.value.length + " characters";
  undoBtn.disabled = undoStates.length === 0;
  redoBtn.disabled = redoStates.length === 0;
  document.getElementById("undoCount").textContent = undoStates.length + (undoStates.length === 1 ? " item" : " items");
  document.getElementById("redoCount").textContent = redoStates.length + (redoStates.length === 1 ? " item" : " items");
}

function renderStack(element, items) {
  element.innerHTML = "";
  if (!items.length) {
    element.innerHTML = '<div class="empty-stack">Stack is empty</div>';
    return;
  }
  // Stack top is the last array item. The visual is rendered bottom-to-top.
  items.forEach((value, index) => {
    const node = document.createElement("div");
    node.className = "stack-item" + (index === items.length - 1 ? " top" : "");
    const compact = value.replace(/\s+/g, " ").trim();
    node.textContent = (index === items.length - 1 ? "TOP  ·  " : "") + (compact || "(empty document)");
    node.title = value;
    element.appendChild(node);
  });
}

function renderVersions() {
  versionsEl.innerHTML = "";
  document.getElementById("versionCount").textContent = versions.length + (versions.length === 1 ? " version" : " versions");
  [...versions].reverse().forEach((version, reverseIndex) => {
    const actualIndex = versions.length - 1 - reverseIndex;
    const row = document.createElement("div");
    row.className = "version" + (version.text === current ? " current" : "");
    const dot = document.createElement("span");
    dot.className = "version-dot";
    const info = document.createElement("div");
    info.className = "version-info";
    const title = document.createElement("b");
    title.textContent = "Version " + (actualIndex + 1) + (version.text === current ? " · Current" : "");
    const desc = document.createElement("small");
    const preview = version.text.replace(/\s+/g, " ").trim();
    desc.textContent = version.label + " — " + (preview.slice(0, 52) || "(empty document)");
    info.append(title, desc);
    const restore = document.createElement("button");
    restore.className = "restore-btn";
    restore.textContent = "Restore";
    restore.disabled = version.text === current;
    restore.addEventListener("click", () => perform("restore", version.text, "Restored version " + (actualIndex + 1)));
    row.append(dot, info, restore);
    versionsEl.appendChild(row);
  });
}

function renderAll() {
  editor.value = current;
  updateCounts();
  renderStack(undoVisual, undoStates);
  renderStack(redoVisual, redoStates);
  renderVersions();
}

async function perform(action, newText = "", label = "") {
  try {
    document.getElementById("saveStatus").textContent = "● Working...";
    const response = await fetch("/api/action", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        action,
        current,
        newText,
        undo: undoStates,
        redo: redoStates
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    const changed = data.current !== current;
    current = data.current;
    undoStates = data.undo;
    redoStates = data.redo;

    if (changed) {
      const versionLabel = label || (action === "undo" ? "Undo action" : action === "redo" ? "Redo action" : "Edited document");
      versions.push({text: current, label: versionLabel, time: new Date()});
    }
    renderAll();
    document.getElementById("saveStatus").textContent = "● All changes tracked";
    if (action === "undo") showToast(changed ? "Undo successful — previous state restored." : "Nothing to undo.");
    else if (action === "redo") showToast(changed ? "Redo successful — change reapplied." : "Nothing to redo.");
    else if (action === "restore") showToast("Previous version restored.");
    else if (action === "edit") showToast("Change added to Undo Stack.");
    else if (action === "save") showToast("Version saved to history.");
  } catch (error) {
    document.getElementById("saveStatus").textContent = "● Error";
    showToast(error.message);
  }
}

let editTimer;
editor.addEventListener("input", () => {
  clearTimeout(editTimer);
  document.getElementById("saveStatus").textContent = "● Unsaved edit";
  editTimer = setTimeout(() => {
    perform("edit", editor.value, "Edited document");
  }, 450);
});

undoBtn.addEventListener("click", () => perform("undo"));
redoBtn.addEventListener("click", () => perform("redo"));
document.getElementById("saveBtn").addEventListener("click", () => {
  clearTimeout(editTimer);
  if (editor.value !== current) {
    perform("edit", editor.value, "Saved document");
  } else {
    versions.push({text: current, label: "Manual save", time: new Date()});
    renderVersions();
    showToast("Version saved to history.");
  }
});
document.getElementById("historyNav").addEventListener("click", () => {
  document.getElementById("historyPanel").scrollIntoView({behavior: "smooth", block: "center"});
});

editor.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    clearTimeout(editTimer);
    if (editor.value !== current) perform("edit", editor.value, "Edited document");
    else perform("undo");
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
    event.preventDefault();
    clearTimeout(editTimer);
    perform("redo");
  }
});

renderAll();
