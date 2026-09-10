export function installPointerReorder({ grid, manager }) {
  let drag = null;

  grid.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".module-drag-handle");
    if (!handle) return;
    const card = handle.closest(".admin-module-card");
    if (!card || card.dataset.state === "closed") return;

    drag = { card, pointerId: event.pointerId };
    card.classList.add("is-dragging");
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });

  grid.addEventListener("pointermove", (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".admin-module-card");
    if (!target || target === drag.card || target.dataset.state === "closed") return;

    const rect = target.getBoundingClientRect();
    const before = event.clientY < rect.top + rect.height / 2;
    grid.insertBefore(drag.card, before ? target : target.nextSibling);
  });

  const finish = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.card.classList.remove("is-dragging");
    drag = null;
    manager.readOrderFromDom();
  };

  grid.addEventListener("pointerup", finish);
  grid.addEventListener("pointercancel", finish);
}
