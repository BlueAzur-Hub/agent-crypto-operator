const VALID_STATES = new Set(["active", "minimized", "suspended", "closed"]);

export class ModuleManager {
  constructor({ grid, template, closedTray, eventBus, storageKey }) {
    this.grid = grid;
    this.template = template;
    this.closedTray = closedTray;
    this.eventBus = eventBus;
    this.storageKey = storageKey;
    this.modules = new Map();
    this.order = [];
  }

  register(moduleDefinition) {
    if (!moduleDefinition?.id || this.modules.has(moduleDefinition.id)) {
      throw new Error(`Module invalide ou déjà enregistré: ${moduleDefinition?.id ?? "sans-id"}`);
    }

    const card = this.template.content.firstElementChild.cloneNode(true);
    card.dataset.moduleId = moduleDefinition.id;
    card.dataset.size = moduleDefinition.size ?? "normal";
    card.querySelector(".module-kicker").textContent = moduleDefinition.kicker ?? "MODULE";
    card.querySelector(".module-title").textContent = moduleDefinition.title;
    card.querySelector('[data-role="body"]').innerHTML = moduleDefinition.render();

    const record = {
      definition: moduleDefinition,
      card,
      state: "active",
      mounted: false,
    };

    this.modules.set(moduleDefinition.id, record);
    this.order.push(moduleDefinition.id);
    this.grid.appendChild(card);

    card.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;
      const action = actionButton.dataset.action;
      if (action === "minimize") this.toggleMinimize(moduleDefinition.id);
      if (action === "suspend") this.toggleSuspend(moduleDefinition.id);
      if (action === "close") this.setState(moduleDefinition.id, "closed");
    });

    this.mount(moduleDefinition.id);
    this.updateCard(record);
  }

  mount(id) {
    const record = this.modules.get(id);
    if (!record || record.mounted) return;
    record.definition.mount?.(this.contextFor(record));
    record.mounted = true;
  }

  contextFor(record) {
    return {
      id: record.definition.id,
      card: record.card,
      body: record.card.querySelector('[data-role="body"]'),
      eventBus: this.eventBus,
    };
  }

  setState(id, nextState, { persist = true } = {}) {
    const record = this.modules.get(id);
    if (!record || !VALID_STATES.has(nextState)) return;
    const previousState = record.state;
    if (previousState === nextState) return;

    if (nextState === "closed") {
      record.definition.destroy?.(this.contextFor(record));
      record.mounted = false;
    } else if (previousState === "closed") {
      this.mount(id);
      if (nextState === "suspended") record.definition.suspend?.(this.contextFor(record));
    } else {
      if (previousState === "suspended" && nextState !== "suspended") {
        record.definition.resume?.(this.contextFor(record));
      }
      if (nextState === "suspended") {
        record.definition.suspend?.(this.contextFor(record));
      }
    }

    record.state = nextState;
    this.updateCard(record);
    this.renderClosedTray();
    if (persist) this.saveLayout();
    this.eventBus.emit("module-state-change", { id, previousState, nextState });
  }

  toggleMinimize(id) {
    const record = this.modules.get(id);
    if (!record || record.state === "suspended" || record.state === "closed") return;
    this.setState(id, record.state === "minimized" ? "active" : "minimized");
  }

  toggleSuspend(id) {
    const record = this.modules.get(id);
    if (!record) return;
    this.setState(id, record.state === "suspended" ? "active" : "suspended");
  }

  updateCard(record) {
    record.card.dataset.state = record.state;
    const status = record.card.querySelector('[data-role="status"]');
    const minimize = record.card.querySelector('[data-action="minimize"]');
    const suspend = record.card.querySelector('[data-action="suspend"]');

    status.textContent = record.state.toUpperCase();
    minimize.title = record.state === "minimized" ? "Déployer" : "Réduire";
    suspend.title = record.state === "suspended" ? "Reprendre" : "Suspendre";
  }

  renderClosedTray() {
    const closed = [...this.modules.values()].filter((record) => record.state === "closed");
    this.closedTray.replaceChildren();
    if (closed.length === 0) {
      const empty = document.createElement("span");
      empty.className = "closed-modules-empty";
      empty.textContent = "Aucun";
      this.closedTray.appendChild(empty);
      return;
    }

    for (const record of closed) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "closed-module-chip";
      button.textContent = `Restaurer · ${record.definition.title}`;
      button.addEventListener("click", () => this.setState(record.definition.id, "active"));
      this.closedTray.appendChild(button);
    }
  }

  applyOrder(order, { persist = true } = {}) {
    const known = order.filter((id) => this.modules.has(id));
    const missing = [...this.modules.keys()].filter((id) => !known.includes(id));
    this.order = [...known, ...missing];
    for (const id of this.order) this.grid.appendChild(this.modules.get(id).card);
    if (persist) this.saveLayout();
  }

  readOrderFromDom() {
    this.order = [...this.grid.querySelectorAll(".admin-module-card")].map((card) => card.dataset.moduleId);
    this.saveLayout();
  }

  saveLayout() {
    const states = {};
    for (const [id, record] of this.modules) states[id] = record.state;
    const payload = { version: 1, order: this.order, states };
    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  restoreLayout() {
    let payload;
    try {
      payload = JSON.parse(localStorage.getItem(this.storageKey) ?? "null");
    } catch {
      payload = null;
    }
    if (!payload || payload.version !== 1) {
      this.renderClosedTray();
      return;
    }

    this.applyOrder(Array.isArray(payload.order) ? payload.order : [], { persist: false });
    for (const [id, state] of Object.entries(payload.states ?? {})) {
      if (VALID_STATES.has(state)) this.setState(id, state, { persist: false });
    }
    this.renderClosedTray();
  }

  resetLayout() {
    localStorage.removeItem(this.storageKey);
    this.applyOrder([...this.modules.keys()], { persist: false });
    for (const id of this.modules.keys()) this.setState(id, "active", { persist: false });
    this.renderClosedTray();
    this.saveLayout();
  }
}
