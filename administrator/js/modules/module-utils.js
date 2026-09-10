export function contractRows(rows) {
  return `<div class="module-contract">${rows.map(([label, value]) => `
    <div class="module-contract-row">
      <b>${label}</b>
      <span>${value}</span>
    </div>`).join("")}</div>`;
}

export function createStaticLifecycle(id) {
  return {
    mount({ card }) { card.dataset.lifecycle = `${id}:mounted`; },
    suspend({ card }) { card.dataset.lifecycle = `${id}:suspended`; },
    resume({ card }) { card.dataset.lifecycle = `${id}:mounted`; },
    destroy({ card }) { card.dataset.lifecycle = `${id}:destroyed`; },
  };
}
