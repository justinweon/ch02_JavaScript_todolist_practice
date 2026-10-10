const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const allTask = document.querySelector("#allTask");

const filterButtons = document.querySelectorAll("[data-filter]");

const allCount = document.querySelector("#all-count");
const activeCount = document.querySelector("#active-count");
const doneCount = document.querySelector("#done-count");

const summary = document.querySelector("#summary");
const emptyMessage = document.querySelector("#empty-message");

// 2. Store the app's current data.
let tasks = [];
let currentFilter = "all";
let nextId = 1;

// 3. Add a task when the form is submitted.
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  const newTask = {
    id: nextId,
    text: text,
    done: false,
  };

  tasks.push(newTask);
  nextId += 1;

  input.value = "";

  // Show all tasks so the newly added task is visible.
  currentFilter = "all";

  renderTasks();
  input.focus();
});

// 4. Change which tasks are displayed.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

// 5. Draw the list from the current task data.
function renderTasks() {
  // Remove the old displayed rows before rebuilding them.
  allTask.replaceChildren();

  const visibleTasks = tasks.filter((task) => {
    if (currentFilter === "active") {
      return !task.done;
    }

    if (currentFilter === "done") {
      return task.done;
    }

    return true;
  });

  visibleTasks.forEach((task) => {
    const row = document.createElement("li");

    row.className =
      "flex flex-wrap items-center gap-3 border-b border-stone-300 py-6 sm:gap-4";

    // This template contains fixed markup, not user-entered text.
    row.innerHTML = `
      <label class="relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          class="peer sr-only"
          aria-label="Mark task as done"
        />
        <span
          aria-hidden="true"
          class="peer-focus-visible:outline peer-focus-visible:outline-1"
        >[ ]</span>
      </label>

      <span
        data-task-text
        class="min-w-0 flex-1 break-words"
      ></span>

      <div class="ml-auto flex gap-3 text-xs text-stone-600">
        <button
          type="button"
          data-edit
          class="min-h-11 cursor-pointer hover:text-black hover:underline"
        >[ edit ]</button>

        <button
          type="button"
          data-delete
          class="min-h-11 cursor-pointer hover:text-black hover:underline"
        >[ delete ]</button>
      </div>
    `;

    const checkbox = row.querySelector('input[type="checkbox"]');
    const checkboxSymbol = row.querySelector("[aria-hidden]");
    const taskText = row.querySelector("[data-task-text]");
    const editButton = row.querySelector("[data-edit]");
    const deleteButton = row.querySelector("[data-delete]");

    // Fill this row with its task's data.
    taskText.textContent = task.text;
    checkbox.checked = task.done;
    checkboxSymbol.textContent = task.done ? "[•]" : "[ ]";

    if (task.done) {
      taskText.classList.add("line-through", "text-stone-500");
      checkbox.setAttribute("aria-label", "Mark task as active");
    }

    // Complete or uncomplete this task.
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      renderTasks();
    });

    // Delete this task.
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      renderTasks();
    });

    // Edit this task.
    editButton.addEventListener("click", () => {
      startEditing(task, taskText, editButton);
    });

    allTask.append(row);
  });

  updateSummary();

  // Show a helpful message when the selected list is empty.
  emptyMessage.hidden = visibleTasks.length > 0;

  emptyMessage.textContent =
    currentFilter === "all"
      ? "No tasks yet. Add your first one above."
      : `No ${currentFilter} tasks.`;

  // Highlight the selected filter.
  filterButtons.forEach((button) => {
    const isSelected = button.dataset.filter === currentFilter;

    button.classList.toggle("border-current", isSelected);
    button.classList.toggle("border-transparent", !isSelected);
    button.classList.toggle("opacity-50", !isSelected);

    button.setAttribute("aria-pressed", String(isSelected));
  });
}

// 6. Replace a task's text with an editing form.
function startEditing(task, taskText, editButton) {
  // Prevent opening a second editor on the same row.
  editButton.disabled = true;
  editButton.classList.add("opacity-40");

  const editForm = document.createElement("form");

  editForm.className = "flex min-w-0 flex-1 flex-wrap items-center gap-2";

  editForm.innerHTML = `
    <input
      type="text"
      aria-label="Edit task"
      maxlength="200"
      required
      class="min-w-0 flex-1 border-b border-stone-600 bg-transparent py-2 outline-none focus-visible:ring-1 focus-visible:ring-stone-500"
    />

    <button
      type="submit"
      class="min-h-11 cursor-pointer text-xs hover:underline"
    >[ save ]</button>

    <button
      type="button"
      data-cancel
      class="min-h-11 cursor-pointer text-xs hover:underline"
    >[ cancel ]</button>
  `;

  const editInput = editForm.querySelector("input");
  const cancelButton = editForm.querySelector("[data-cancel]");

  editInput.value = task.text;

  taskText.replaceWith(editForm);

  editInput.focus();
  editInput.select();

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const updatedText = editInput.value.trim();

    if (updatedText === "") {
      editInput.focus();
      return;
    }

    task.text = updatedText;
    renderTasks();
  });

  cancelButton.addEventListener("click", () => {
    renderTasks();
  });

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      renderTasks();
    }
  });
}

// 7. Update counts from the full task array.
function updateSummary() {
  const completedTasks = tasks.filter((task) => task.done).length;
  const activeTasks = tasks.length - completedTasks;

  allCount.textContent = tasks.length;
  activeCount.textContent = activeTasks;
  doneCount.textContent = completedTasks;

  summary.textContent = `${activeTasks} tasks left / ${completedTasks} done`;
}

// 8. Draw the initial empty state.
renderTasks();
