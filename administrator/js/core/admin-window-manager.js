(() => {
  "use strict";

  const VIEWPORT_MARGIN = 12;
  const MIN_WIDTH = 420;
  const MIN_HEIGHT = 90;
  const FLOAT_Z_BASE = 2147481800;

  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  const safeJson = (value, fallback = {}) => {
    try { return JSON.parse(value); } catch { return fallback; }
  };

  function createManager(options = {}) {
    const storagePrefix = options.storagePrefix || "erith_admin_native_windows";
    const definitions = Array.isArray(options.definitions) ? options.definitions : [];
    const defaultFree = options.defaultFree !== false;
    const layoutKey = `${storagePrefix}:layout-free`;
    const domainKey = `${storagePrefix}:domain`;
    const statePrefix = `${storagePrefix}:window:`;

    const windows = new Map();
    let zCounter = FLOAT_Z_BASE;
    let deck = null;
    let deckList = null;
    let deckCount = null;
    let deckBatchDepth40314 = 0;
    let deckBatchPending40314 = false;
    let activeDomain = clean(options.domain || document.documentElement.dataset.atlasMarketDomain || "crypto") || "crypto";
    const displayBackups = new WeakMap();

    const readStorage = (key, fallback = null) => {
      try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
    };
    const writeStorage = (key, value) => {
      try { localStorage.setItem(key, value); return true; } catch { return false; }
    };
    const removeStorage = key => {
      try { localStorage.removeItem(key); } catch {}
    };
    const stateKey = id => `${statePrefix}${id}`;
    const getState = id => safeJson(readStorage(stateKey(id), "{}"), {}) || {};
    const patchState = (id, patch) => {
      const next = { ...getState(id), ...patch };
      writeStorage(stateKey(id), JSON.stringify(next));
      updateDeck();
      return next;
    };

    function clamp(value, min, max) {
      const number = Number(value);
      if (!Number.isFinite(number)) return min;
      return Math.min(max, Math.max(min, number));
    }

    function clampGeometry(geometry = {}) {
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const maxWidth = Math.max(MIN_WIDTH, vw - VIEWPORT_MARGIN * 2);
      const maxHeight = Math.max(MIN_HEIGHT, vh - VIEWPORT_MARGIN * 2);
      const width = clamp(geometry.width || Math.min(1180, vw * .82), Math.min(MIN_WIDTH, maxWidth), maxWidth);
      const height = clamp(geometry.height || Math.min(760, vh * .80), MIN_HEIGHT, maxHeight);
      const maxX = Math.max(VIEWPORT_MARGIN, vw - Math.min(190, width));
      const maxY = Math.max(VIEWPORT_MARGIN, vh - 50);
      return {
        x: clamp(geometry.x ?? VIEWPORT_MARGIN * 2, VIEWPORT_MARGIN, maxX),
        y: clamp(geometry.y ?? VIEWPORT_MARGIN * 2, VIEWPORT_MARGIN, maxY),
        width,
        height
      };
    }

    // 40.1.24 — compact direct-floating geometry policy.
    // Large Administrator panels keep the historical clamp unchanged.
    // Native ribbons may opt into their real height/width and full viewport containment.
    function clampWindowGeometry(win, geometry = {}) {
      const policy = win?.geometryPolicy || null;
      if (!policy) return clampGeometry(geometry);

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const viewportMaxWidth = Math.max(1, vw - VIEWPORT_MARGIN * 2);
      const viewportMaxHeight = Math.max(1, vh - VIEWPORT_MARGIN * 2);
      const configuredMinWidth = Number(policy.minWidth);
      const configuredMinHeight = Number(policy.minHeight);
      const configuredMaxWidth = Number(policy.maxWidth);
      const configuredMaxHeight = Number(policy.maxHeight);
      const minWidth = Number.isFinite(configuredMinWidth) && configuredMinWidth > 0 ? configuredMinWidth : MIN_WIDTH;
      const minHeight = Number.isFinite(configuredMinHeight) && configuredMinHeight > 0 ? configuredMinHeight : MIN_HEIGHT;
      const maxWidth = Math.max(1, Math.min(
        Number.isFinite(configuredMaxWidth) && configuredMaxWidth > 0 ? configuredMaxWidth : viewportMaxWidth,
        viewportMaxWidth
      ));
      const maxHeight = Math.max(1, Math.min(
        Number.isFinite(configuredMaxHeight) && configuredMaxHeight > 0 ? configuredMaxHeight : viewportMaxHeight,
        viewportMaxHeight
      ));
      const width = clamp(geometry.width || Math.min(1180, vw * .82), Math.min(minWidth, maxWidth), maxWidth);
      const height = clamp(geometry.height || Math.min(760, vh * .80), Math.min(minHeight, maxHeight), maxHeight);
      const fullyVisible = policy.keepFullyVisible === true;
      const maxX = fullyVisible
        ? Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN)
        : Math.max(VIEWPORT_MARGIN, vw - Math.min(190, width));
      const maxY = fullyVisible
        ? Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN)
        : Math.max(VIEWPORT_MARGIN, vh - 50);
      return {
        x: clamp(geometry.x ?? VIEWPORT_MARGIN * 2, VIEWPORT_MARGIN, maxX),
        y: clamp(geometry.y ?? VIEWPORT_MARGIN * 2, VIEWPORT_MARGIN, maxY),
        width,
        height
      };
    }

    function entryNode(entry) {
      return entry?.node instanceof HTMLElement ? entry.node : null;
    }

    function normalizeEntries(raw) {
      return (Array.isArray(raw) ? raw : [])
        .map(item => item instanceof HTMLElement ? { node: item, domain: "all" } : item)
        .map(item => ({
          node: entryNode(item),
          domain: clean(item?.domain || "all") || "all"
        }))
        .filter(item => item.node);
    }

    function setNodeSuppressed(node, suppressed) {
      if (!(node instanceof HTMLElement)) return;
      if (suppressed) {
        if (!displayBackups.has(node)) {
          displayBackups.set(node, {
            value: node.style.getPropertyValue("display"),
            priority: node.style.getPropertyPriority("display")
          });
        }
        node.classList.add("admin-native-window-suppressed");
        node.style.setProperty("display", "none", "important");
        return;
      }
      node.classList.remove("admin-native-window-suppressed");
      const backup = displayBackups.get(node);
      if (backup) {
        if (backup.value) node.style.setProperty("display", backup.value, backup.priority || "");
        else node.style.removeProperty("display");
        displayBackups.delete(node);
      } else if (node.style.getPropertyValue("display") === "none" && node.style.getPropertyPriority("display") === "important") {
        node.style.removeProperty("display");
      }
    }

    function createButton(className, text, title) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `admin-native-control ${className}`;
      button.textContent = text;
      button.title = title;
      button.setAttribute("aria-label", title);
      button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
      });
      return button;
    }

    function visibleEntry(win) {
      return win.entries.find(entry => entry.domain === "all" || entry.domain === activeDomain)
        || win.entries[0]
        || null;
    }

    function domainMask(win) {
      win.entries.forEach(entry => {
        const inactive = win.floating && entry.domain !== "all" && entry.domain !== activeDomain;
        entry.node.classList.toggle("admin-native-domain-inactive", inactive);
      });
    }

    // 40.3.01 — docked family compact presentation.
    // This extends Reduce only for definitions that explicitly opt in.
    // Other windows keep the historical minibar path untouched.
    function compactNodes(win) {
      if (!win || typeof win.resolveCompactNodes !== "function") return [];
      let raw = [];
      try { raw = win.resolveCompactNodes(win.nodes, win.entries) || []; } catch { raw = []; }
      return [...new Set((Array.isArray(raw) ? raw : [raw]).filter(node => node instanceof HTMLElement && win.nodes.includes(node)))];
    }

    function compactCollapsedDetails(win) {
      if (!win || typeof win.resolveCompactCollapsedDetails !== "function") return [];
      let raw = [];
      try { raw = win.resolveCompactCollapsedDetails(win.nodes, win.entries) || []; } catch { raw = []; }
      return [...new Set((Array.isArray(raw) ? raw : [raw]).filter(node => node instanceof HTMLDetailsElement && win.nodes.includes(node)))];
    }

    function supportsDockedCompact(win) {
      return !win?.floating && compactNodes(win).length > 0;
    }

    function activateDockedCompact(win) {
      if (!supportsDockedCompact(win)) return false;
      const keep = new Set(compactNodes(win));
      if (!win.compactPresentationActive) {
        win.compactPresentationActive = true;
        win.compactDetailOpenState.clear();
        compactCollapsedDetails(win).forEach(detail => {
          win.compactDetailOpenState.set(detail, detail.open === true);
          if (!win.compactDetailToggleHandlers.has(detail)) {
            const handler = () => {
              if (win.minimized && !win.floating && detail.open) detail.open = false;
            };
            detail.addEventListener("toggle", handler);
            win.compactDetailToggleHandlers.set(detail, handler);
          }
        });
      }
      compactCollapsedDetails(win).forEach(detail => { if (detail.open) detail.open = false; });
      win.nodes.forEach(node => setNodeSuppressed(node, !keep.has(node)));
      win.anchor.classList.add("admin-native-family-compact");
      keep.forEach(node => node.classList.add("admin-native-family-compact-visible"));
      return true;
    }

    function deactivateDockedCompact(win, restoreDetails = true) {
      if (!win) return;
      win.nodes.forEach(node => {
        setNodeSuppressed(node, false);
        node.classList.remove("admin-native-family-compact-visible");
      });
      win.anchor?.classList?.remove("admin-native-family-compact");
      if (restoreDetails && win.compactPresentationActive) {
        win.compactDetailOpenState.forEach((wasOpen, detail) => {
          if (detail instanceof HTMLDetailsElement && detail.isConnected) detail.open = wasOpen === true;
        });
      }
      win.compactDetailOpenState.clear();
      win.compactPresentationActive = false;
    }

    function resolveHomeTarget(win) {
      const preferred = visibleEntry(win)?.node || win.anchor;
      if (preferred?.parentElement) return preferred;
      return win.entries.map(entry => entry.node).find(node => node?.parentElement) || null;
    }

    function armControlDrag(event, win, set) {
      if (!document.body.classList.contains("admin-native-free")) return;
      if (win.maximized) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const button = event.currentTarget;
      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      const initial = currentRect(win);
      let originX = startX;
      let originY = startY;
      let dragBase = initial;
      let moved = false;
      let target = null;
      let finished = false;

      // 40.1.33 — drag continuity must survive DOM reparenting.
      // Shell windows move their REAL nodes into document.body at first detach.
      // Firefox can drop element-level pointer capture when the pressed button is
      // reparented, so the drag lifecycle is owned by window capture listeners.
      // Pointer capture remains a best-effort enhancement, never the sole owner.
      const capturePointer = () => {
        if (!(button instanceof HTMLElement) || !button.isConnected) return;
        try { button.setPointerCapture?.(pointerId); } catch {}
      };

      const releasePointer = () => {
        if (!(button instanceof HTMLElement)) return;
        try {
          if (button.hasPointerCapture?.(pointerId)) button.releasePointerCapture?.(pointerId);
        } catch {}
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", move, true);
        window.removeEventListener("pointerup", end, true);
        window.removeEventListener("pointercancel", end, true);
        window.removeEventListener("blur", abort, true);
        releasePointer();
      };

      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        if (target) {
          document.body.classList.remove("admin-native-dragging");
          target.classList.remove("admin-native-moving");
        }
        if (moved) {
          set.suppressNextClick = true;
          win.geometry = currentRect(win);
          persistGeometry(win);
        }
      };

      const abort = () => finish();

      const move = moveEvent => {
        if (moveEvent.pointerId !== pointerId || finished) return;
        let dx = moveEvent.clientX - originX;
        let dy = moveEvent.clientY - originY;
        if (!moved && Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 6) return;

        if (!moved) {
          moved = true;
          if (!win.floating) {
            let detachGeometry = initial;
            if (typeof win.dragFloatGeometry === "function") {
              try {
                const rawRect = win.anchor?.getBoundingClientRect?.() || null;
                detachGeometry = win.dragFloatGeometry({
                  geometry: initial,
                  rawRect,
                  startX,
                  startY,
                  viewportWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                  viewportHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
                }) || initial;
              } catch {}
            }

            // 40.3.49 — operator drag-detach recovery.
            // The Fil Crypto already proved two things: 40.3.15 disabled the
            // full first-detach auto-fit for Firefox performance, and 40.3.19
            // removed the giant drag plate by fitting HEIGHT only after the real
            // nodes had been reparented. Keep that proven drag path local here.
            // IMPORTANT: persisted restore/setFloating ownership is untouched.
            setFloating(win, true, true, detachGeometry, { autoFitShell: false });
            fitDragDetachedShellHeight40319(win);

            // The pressed control may have moved to a different DOM parent.
            // Rebase the gesture from the fitted floating geometry and reacquire
            // capture when Firefox still allows it. No mouse-up/re-click required.
            dragBase = currentRect(win);
            originX = moveEvent.clientX;
            originY = moveEvent.clientY;
            dx = 0;
            dy = 0;
            capturePointer();
          } else {
            // A shell restored from 40.3.15/17/19 stored geometry may still
            // carry the old docked-union height. Keep the 40.3.19 height-only
            // normalizer solely as a legacy fallback when the operator moves it;
            // never reset saved layouts at boot.
            if (!win.directFixed && win.shell && win.shellSizingMode === "stored-geometry") {
              fitDragDetachedShellHeight40319(win);
            }
            dragBase = currentRect(win);
          }

          bringToFront(win);
          target = win.directFixed ? win.anchor : win.shell;
          if (!target) {
            finish();
            return;
          }
          document.body.classList.add("admin-native-dragging");
          target.classList.add("admin-native-moving");
        }

        if (!target) return;
        const safe = clampWindowGeometry(win, {
          x: dragBase.x + dx,
          y: dragBase.y + dy,
          width: dragBase.width,
          height: win.geometry?.height || dragBase.height
        });
        setManagedFloatingStyle(win, target, "left", `${safe.x}px`);
        setManagedFloatingStyle(win, target, "top", `${safe.y}px`);
        moveEvent.preventDefault?.();
      };

      const end = endEvent => {
        if (endEvent.pointerId !== pointerId || finished) return;
        finish();
      };

      capturePointer();
      window.addEventListener("pointermove", move, true);
      window.addEventListener("pointerup", end, true);
      window.addEventListener("pointercancel", end, true);
      window.addEventListener("blur", abort, true);
      event.preventDefault?.();
    }

    function createControlSet(win, host, mini = false, floatingChrome = false) {
      if (!(host instanceof HTMLElement)) return null;
      const controls = document.createElement("div");
      controls.className = mini ? "admin-native-controls admin-native-mini-controls" : "admin-native-controls";
      controls.classList.add(floatingChrome ? "admin-native-controls-floating" : "admin-native-controls-native");
      host.classList.add("admin-native-control-host");
      controls.setAttribute("role", "group");
      controls.setAttribute("aria-label", `Commandes fenêtre Administrator · ${win.title}`);

      const move = createButton("admin-native-move", "⠿", `Déplacer ${win.title}`);
      const minimize = createButton("admin-native-minimize", "—", `Réduire ${win.title}`);
      const float = createButton("admin-native-float", "□", `Détacher ${win.title}`);
      const maximize = createButton("admin-native-maximize", "⤢", `Agrandir ${win.title}`);
      const hide = createButton("admin-native-hide", "×", `Masquer ${win.title} · rappel via WINDOWS`);
      controls.append(move, minimize, float, maximize, hide);

      const set = { root: controls, move, minimize, float, maximize, hide, mini, floatingChrome, suppressNextClick: false };
      move.addEventListener("pointerdown", event => armControlDrag(event, win, set));
      move.addEventListener("click", () => {
        if (set.suppressNextClick) {
          set.suppressNextClick = false;
          return;
        }
        if (win.floating) bringToFront(win, false);
      });
      minimize.addEventListener("click", () => setMinimized(win, !win.minimized));
      float.addEventListener("click", () => setFloating(win, !win.floating));
      maximize.addEventListener("click", () => setMaximized(win, !win.maximized));
      hide.addEventListener("click", () => setHidden(win, true));

      host.appendChild(controls);
      win.controlSets.push(set);
      return set;
    }

    function refreshControlState(win) {
      win.controlSets.forEach(set => {
        const { minimize, float, maximize, move } = set;
        if (move) {
          move.title = win.floating ? `Déplacer ${win.title}` : `Détacher et déplacer ${win.title}`;
          move.setAttribute("aria-label", move.title);
        }
        if (minimize) {
          minimize.textContent = win.minimized ? "+" : "—";
          minimize.title = win.minimized ? `Restaurer ${win.title}` : `Réduire ${win.title}`;
          minimize.setAttribute("aria-label", minimize.title);
        }
        if (float) {
          float.textContent = win.floating ? "▣" : "□";
          float.title = win.floating ? `Raccrocher ${win.title}` : `Détacher ${win.title}`;
          float.setAttribute("aria-label", float.title);
        }
        if (maximize) {
          maximize.textContent = win.maximized ? "↙" : "⤢";
          maximize.title = win.maximized ? `Restaurer la taille de ${win.title}` : `Agrandir ${win.title}`;
          maximize.setAttribute("aria-label", maximize.title);
        }
      });
      if (win.shellTitle) win.shellTitle.textContent = win.title;
      if (win.minimizeBarTitle) win.minimizeBarTitle.textContent = win.title;
    }

    function resolveDefinition(def) {
      const entries = normalizeEntries(typeof def.resolveEntries === "function" ? def.resolveEntries() : (typeof def.resolveNodes === "function" ? def.resolveNodes() : []));
      if (!entries.length) return null;
      const nodes = entries.map(entry => entry.node);
      const anchor = typeof def.resolveAnchor === "function" ? def.resolveAnchor(nodes, entries) : nodes[0];
      if (!(anchor instanceof HTMLElement) || !nodes.includes(anchor)) return null;

      const win = {
        id: clean(def.id),
        title: clean(def.title) || clean(def.id) || "Fenêtre",
        tone: clean(def.tone || "neutral") || "neutral",
        entries,
        nodes,
        anchor,
        directFixed: def.directFixed === true,
        preferredFloatGeometry: typeof def.preferredFloatGeometry === "function" ? def.preferredFloatGeometry : null,
        dragFloatGeometry: typeof def.dragFloatGeometry === "function" ? def.dragFloatGeometry : null,
        geometryPolicy: def.geometryPolicy && typeof def.geometryPolicy === "object" ? { ...def.geometryPolicy } : null,
        placeholderPolicy: clean(def.placeholderPolicy || "preserve") || "preserve",
        resolvePortalHost: typeof def.resolvePortalHost === "function" ? def.resolvePortalHost : null,
        resolveCompactNodes: typeof def.resolveCompactNodes === "function" ? def.resolveCompactNodes : null,
        resolveCompactCollapsedDetails: typeof def.resolveCompactCollapsedDetails === "function" ? def.resolveCompactCollapsedDetails : null,
        compactPresentationActive: false,
        compactDetailOpenState: new Map(),
        compactDetailToggleHandlers: new Map(),
        controlSets: [],
        placeholders: new Map(),
        shell: null,
        shellTitle: null,
        shellSizingMode: null,
        floating: false,
        minimized: false,
        hidden: false,
        maximized: false,
        geometry: null,
        restoreGeometry: null,
        restoreFloating: false,
        directPointerUp: null,
        minimizeBar: null,
        minimizeBarTitle: null,
        minimizeBarScore: null,
        minimizeBarScoreObserver: null,
        minimizeBarDragCleanup: null
      };

      win.nodes.forEach(node => node.dataset.adminNativeWindow = win.id);
      win.anchor.classList.add("admin-native-anchor", `admin-native-window-${win.id}`, `admin-native-tone-${win.tone}`);
      win.anchor.dataset.adminNativeTitle = win.title;

      let controlHosts = typeof def.resolveControlHosts === "function"
        ? def.resolveControlHosts(nodes, entries)
        : [anchor];
      controlHosts = [...new Set((Array.isArray(controlHosts) ? controlHosts : [controlHosts]).filter(node => node instanceof HTMLElement))];
      if (!controlHosts.length) controlHosts = [anchor];
      controlHosts.forEach(host => createControlSet(win, host, false));
      return win;
    }

    function visibleNodeUnionRect(win) {
      const rects = (win?.nodes || [])
        .map(node => {
          if (!(node instanceof HTMLElement)) return null;
          const computed = window.getComputedStyle?.(node);
          if (String(computed?.display || "").toLowerCase() === "none") return null;
          if (String(computed?.visibility || "").toLowerCase() === "hidden") return null;
          const rect = node.getBoundingClientRect?.();
          if (!rect || rect.width <= 0 || rect.height <= 0) return null;
          return rect;
        })
        .filter(Boolean);
      if (!rects.length) return null;

      const left = Math.min(...rects.map(rect => rect.left));
      const top = Math.min(...rects.map(rect => rect.top));
      const right = Math.max(...rects.map(rect => rect.right));
      const bottom = Math.max(...rects.map(rect => rect.bottom));
      return {
        left,
        top,
        right,
        bottom,
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top)
      };
    }

    function currentRect(win) {
      let rect = null;

      if (win?.floating) {
        const target = win.directFixed ? win.anchor : win.shell;
        rect = target?.getBoundingClientRect?.() || null;
      } else if (!win?.directFixed && (win?.nodes?.length || 0) > 1) {
        // 40.1.30 — multi-node Administrator families must be measured as the
        // union of every visible member, not only from the small family anchor.
        rect = visibleNodeUnionRect(win) || win.anchor?.getBoundingClientRect?.() || null;
      } else {
        rect = win?.anchor?.getBoundingClientRect?.() || null;
      }

      if (!rect) return win?.floating ? clampWindowGeometry(win, win.geometry || {}) : clampGeometry(win.geometry || {});
      const geometry = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: win.minimized && win.geometry?.height ? win.geometry.height : rect.height
      };
      return win?.floating ? clampWindowGeometry(win, geometry) : clampGeometry(geometry);
    }

    // 40.1.32 — directFixed geometry must outrank legacy dock CSS.
    // Graphique and Math Core still have old high-specificity !important
    // position/top rules in the canonical Classic-derived stylesheet.
    // A floating directFixed window therefore owns its geometry inline with
    // !important while detached, then releases every override when docked.
    function setManagedFloatingStyle(win, target, property, value) {
      if (!(target instanceof HTMLElement)) return;
      const direct = win?.directFixed === true;
      target.style.setProperty(property, String(value), direct ? "important" : "");
    }

    function applyDirectFixedGeometryOwnership(win, target) {
      if (!win?.directFixed || !(target instanceof HTMLElement)) return;
      setManagedFloatingStyle(win, target, "position", "fixed");
      setManagedFloatingStyle(win, target, "right", "auto");
      setManagedFloatingStyle(win, target, "bottom", "auto");
      setManagedFloatingStyle(win, target, "transform", "none");
      setManagedFloatingStyle(win, target, "min-width", "0");
      setManagedFloatingStyle(win, target, "max-width", `calc(100vw - ${VIEWPORT_MARGIN * 2}px)`);
      setManagedFloatingStyle(win, target, "min-height", "0");
      setManagedFloatingStyle(win, target, "max-height", `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`);
    }

    function setGeometryOnTarget(win, geometry) {
      const safe = clampWindowGeometry(win, geometry);
      win.geometry = { ...safe };
      const target = win.directFixed ? win.anchor : win.shell;
      if (target) {
        if (win.directFixed) applyDirectFixedGeometryOwnership(win, target);
        setManagedFloatingStyle(win, target, "left", `${safe.x}px`);
        setManagedFloatingStyle(win, target, "top", `${safe.y}px`);
        setManagedFloatingStyle(win, target, "width", `${safe.width}px`);
        if (!win.minimized) setManagedFloatingStyle(win, target, "height", `${safe.height}px`);
      }
      return safe;
    }

    // 40.1.32 — floating shells are not all the same height. On the first
    // detach, measure the REAL shell after titlebar + nodes have been inserted,
    // then fit its border-box height to content and cap only at the viewport.
    // directFixed windows are deliberately excluded from this path.
    function shellBoxMetrics(shell) {
      const style = window.getComputedStyle?.(shell);
      const px = value => Number.parseFloat(String(value || "0")) || 0;
      return {
        horizontal: px(style?.paddingLeft) + px(style?.paddingRight) + px(style?.borderLeftWidth) + px(style?.borderRightWidth),
        verticalBorder: px(style?.borderTopWidth) + px(style?.borderBottomWidth)
      };
    }

    function autoFitFloatingShell(win, shell, geometry = {}) {
      if (!win || win.directFixed || !(shell instanceof HTMLElement)) {
        return setGeometryOnTarget(win, geometry);
      }

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const viewportMaxWidth = Math.max(MIN_WIDTH, vw - VIEWPORT_MARGIN * 2);
      const viewportMaxHeight = Math.max(MIN_HEIGHT, vh - VIEWPORT_MARGIN * 2);
      const base = clampGeometry(geometry || {});
      const box = shellBoxMetrics(shell);

      // Preserve the native content width when possible. The shell itself adds
      // horizontal padding/borders around those real nodes.
      const width = clamp(
        Math.ceil((Number(base.width) || MIN_WIDTH) + box.horizontal),
        Math.min(MIN_WIDTH, viewportMaxWidth),
        viewportMaxWidth
      );

      shell.style.left = `${VIEWPORT_MARGIN}px`;
      shell.style.top = `${VIEWPORT_MARGIN}px`;
      shell.style.width = `${width}px`;
      shell.style.height = "auto";
      shell.style.maxHeight = "none";
      shell.style.overflow = "visible";

      // Force one layout pass at the final width, then read the complete shell:
      // titlebar, floating controls, padding and every visible real node.
      void shell.offsetHeight;
      const naturalHeight = Math.max(
        MIN_HEIGHT,
        Math.ceil((Number(shell.scrollHeight) || Number(shell.offsetHeight) || MIN_HEIGHT) + box.verticalBorder)
      );
      const height = Math.min(naturalHeight, viewportMaxHeight);

      // The window must remain fully visible after auto-fit. If the native dock
      // was near the bottom of the viewport, move the floating shell upward only
      // as much as required to keep the complete fitted window reachable.
      const maxX = Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN);
      const maxY = Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN);
      const x = clamp(Number(base.x), VIEWPORT_MARGIN, maxX);
      const y = clamp(Number(base.y), VIEWPORT_MARGIN, maxY);

      shell.style.removeProperty("max-height");
      shell.style.removeProperty("overflow");
      shell.style.left = `${x}px`;
      shell.style.top = `${y}px`;
      shell.style.width = `${width}px`;
      shell.style.height = `${height}px`;

      const overflowed = naturalHeight > height + 1;
      shell.dataset.adminNativeShellSizing = "content-plus-chrome";
      shell.dataset.adminNativeShellNaturalHeight = String(naturalHeight);
      shell.dataset.adminNativeShellFittedHeight = String(height);
      shell.dataset.adminNativeShellViewportClamped = overflowed ? "1" : "0";
      win.shellSizingMode = "content-plus-chrome";
      win.geometry = { x, y, width, height };
      return { ...win.geometry };
    }

    // 40.3.19 — drag-detach height fit, recovered from the real operator symptom.
    // The grey plate is not an empty-shell problem: it is the legitimate shell
    // retaining the large docked union height while its real nodes have already
    // been reparented into a much more compact floating stack.
    //
    // Keep the validated 40.3.17 visual shell/background and every real node.
    // On the first drag-detach (or first move of a restored stored-geometry shell),
    // perform ONE height-only content measurement. Width, x-position, window
    // ownership, menus and saved workspace data remain untouched.
    function fitDragDetachedShellHeight40319(win) {
      if (!win || win.directFixed || !win.floating || !(win.shell instanceof HTMLElement)) return false;
      if (win.maximized || win.minimized || win.hidden) return false;

      const shell = win.shell;
      const rect = shell.getBoundingClientRect?.();
      if (!rect || rect.width <= 1) return false;

      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const viewportMaxHeight = Math.max(MIN_HEIGHT, vh - VIEWPORT_MARGIN * 2);
      const computed = window.getComputedStyle?.(shell);
      const px = value => Number.parseFloat(String(value || "0")) || 0;
      const borderY = px(computed?.borderTopWidth) + px(computed?.borderBottomWidth);

      // Height only. No width rewrite, no descendant scan, no observer, no loop.
      shell.style.setProperty("height", "auto");
      shell.style.setProperty("max-height", "none");
      shell.style.setProperty("overflow", "visible");
      void shell.offsetHeight;

      const naturalHeight = Math.max(
        MIN_HEIGHT,
        Math.ceil((Number(shell.scrollHeight) || Number(shell.offsetHeight) || MIN_HEIGHT) + borderY)
      );
      const height = Math.min(naturalHeight, viewportMaxHeight);
      const x = clamp(rect.left, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vw - Math.min(190, rect.width)));
      const y = clamp(rect.top, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN));

      shell.style.removeProperty("max-height");
      shell.style.removeProperty("overflow");
      setManagedFloatingStyle(win, shell, "left", `${x}px`);
      setManagedFloatingStyle(win, shell, "top", `${y}px`);
      setManagedFloatingStyle(win, shell, "height", `${height}px`);

      shell.dataset.adminNativeShellSizing = "drag-height-fit-40319";
      shell.dataset.adminNativeShellNaturalHeight = String(naturalHeight);
      shell.dataset.adminNativeShellFittedHeight = String(height);
      shell.dataset.adminNativeShellViewportClamped = naturalHeight > height + 1 ? "1" : "0";
      win.shellSizingMode = "drag-height-fit-40319";
      win.geometry = { x, y, width: rect.width, height };
      return true;
    }

    function persistGeometry(win) {
      if (!win?.floating || win.maximized) return;
      const rect = currentRect(win);
      const safe = {
        ...rect,
        height: win.geometry?.height || rect.height
      };
      win.geometry = { ...safe };
      patchState(win.id, {
        floating: true,
        x: safe.x,
        y: safe.y,
        width: safe.width,
        height: safe.height,
        z: Number((win.directFixed ? win.anchor : win.shell)?.style.zIndex) || zCounter
      });
    }

    // 40.3.15 — batch placeholder measurements before DOM writes.
    // Keeps the 40.1.29 layout-preservation contract without interleaving
    // getBoundingClientRect/getComputedStyle with insertBefore for every node.
    function createPlaceholders(win) {
      win.placeholders.clear();
      const measurements = win.nodes.map(node => {
        if (!node.parentNode) return null;
        const rect = node.getBoundingClientRect?.();
        const computed = window.getComputedStyle?.(node);
        const rendered = !!rect
          && rect.width > 0
          && rect.height > 0
          && String(computed?.display || "").toLowerCase() !== "none"
          && String(computed?.visibility || "").toLowerCase() !== "hidden";
        return {
          node,
          parent: node.parentNode,
          rendered,
          height: rendered ? Math.max(1, Math.round(rect.height)) : 0,
          marginTop: computed?.marginTop || "0px",
          marginRight: computed?.marginRight || "0px",
          marginBottom: computed?.marginBottom || "0px",
          marginLeft: computed?.marginLeft || "0px",
          gridColumn: computed?.gridColumn || "auto",
          gridRow: computed?.gridRow || "auto",
          alignSelf: computed?.alignSelf || "auto",
          justifySelf: computed?.justifySelf || "auto",
          flexGrow: computed?.flexGrow || "0",
          flexShrink: computed?.flexShrink || "1",
          flexBasis: computed?.flexBasis || "auto",
          order: computed?.order || "0"
        };
      }).filter(Boolean);

      measurements.forEach(item => {
        const {node,parent,rendered}=item;
        if (!parent || node.parentNode !== parent) return;
        const compactFamily = win.placeholderPolicy === "compact-family";
        const reserve = rendered && (!compactFamily || node === win.anchor);
        const marker=document.createElement("div");
        marker.className="admin-native-placeholder";
        marker.dataset.adminNativePlaceholder=win.id;
        marker.dataset.adminNativePlaceholderReserved=reserve ? "1" : "0";
        marker.dataset.adminNativePlaceholderPolicy=win.placeholderPolicy || "preserve";
        marker.setAttribute("aria-hidden","true");
        marker.style.pointerEvents="none";
        marker.style.userSelect="none";
        if (reserve) {
          const reservedHeight = compactFamily ? 18 : item.height;
          marker.style.display="block";
          marker.style.visibility="hidden";
          marker.style.boxSizing="border-box";
          marker.style.width="auto";
          marker.style.minWidth="0";
          marker.style.height=`${reservedHeight}px`;
          marker.style.minHeight=`${reservedHeight}px`;
          marker.style.marginTop=compactFamily ? "0px" : item.marginTop;
          marker.style.marginRight=item.marginRight;
          marker.style.marginBottom=compactFamily ? "0px" : item.marginBottom;
          marker.style.marginLeft=item.marginLeft;
          marker.style.gridColumn=item.gridColumn;
          marker.style.gridRow=item.gridRow;
          marker.style.alignSelf=item.alignSelf;
          marker.style.justifySelf=item.justifySelf;
          marker.style.flexGrow="0";
          marker.style.flexShrink="0";
          marker.style.flexBasis=compactFamily ? "18px" : item.flexBasis;
          marker.style.order=item.order;
        } else {
          marker.hidden=true;
          marker.style.display="none";
          marker.style.height="0";
          marker.style.minHeight="0";
          marker.style.margin="0";
        }
        parent.insertBefore(marker,node);
        win.placeholders.set(node,marker);
      });
    }

    function resolvePortalHost(win) {
      const requested = win.resolvePortalHost?.(activeDomain, win);
      if (requested instanceof HTMLElement) return requested;
      // 40.1.30 — every real floating shell must escape local stacking/overflow
      // contexts by default. Placeholders still restore native nodes on dock.
      return document.body;
    }

    function buildShell(win, geometry, options = {}) {
      if (win.shell?.isConnected) return win.shell;
      createPlaceholders(win);
      const shell = document.createElement("section");
      shell.className = `admin-native-floating-shell admin-native-tone-${win.tone}`;
      shell.dataset.adminNativeShell = win.id;
      shell.setAttribute("aria-label", `Fenêtre flottante ${win.title}`);

      const titlebar = document.createElement("header");
      titlebar.className = "admin-native-floating-titlebar";
      const title = document.createElement("strong");
      title.className = "admin-native-floating-title";
      title.textContent = win.title;
      titlebar.appendChild(title);
      shell.appendChild(titlebar);
      win.shellTitle = title;
      win.shell = shell;
      createControlSet(win, titlebar, false, true);

      resolvePortalHost(win).appendChild(shell);
      win.nodes.forEach(node => shell.appendChild(node));
      domainMask(win);
      const baseGeometry = geometry || currentRect(win);
      if (options.autoFit === true) {
        autoFitFloatingShell(win, shell, baseGeometry);
      } else {
        shell.dataset.adminNativeShellSizing = "stored-geometry";
        shell.dataset.adminNativeShellViewportClamped = "unknown";
        win.shellSizingMode = "stored-geometry";
        setGeometryOnTarget(win, baseGeometry);
      }
      shell.addEventListener("pointerdown", () => bringToFront(win, false), { passive: true });
      shell.addEventListener("pointerup", () => persistGeometry(win), { passive: true });
      return shell;
    }

    function syncPortalHost(win) {
      if (!win?.shell?.isConnected) return;
      const host = resolvePortalHost(win);
      if (host && win.shell.parentElement !== host) host.appendChild(win.shell);
    }

    function restoreShellNodes(win) {
      if (!win.shell) return;
      win.nodes.forEach(node => {
        const marker = win.placeholders.get(node);
        if (marker?.parentNode) marker.parentNode.insertBefore(node, marker);
        marker?.remove();
        node.classList.remove("admin-native-domain-inactive");
      });
      win.placeholders.clear();
      const oldShell = win.shell;
      win.controlSets = win.controlSets.filter(set => !set.floatingChrome || !oldShell?.contains(set.root));
      oldShell.remove();
      win.shell = null;
      win.shellTitle = null;
      win.shellSizingMode = null;
    }

    function setDirectFloating(win, floating, geometry) {
      const node = win.anchor;
      if (!node) return;
      if (floating) {
        node.classList.add("admin-native-direct-floating");
        applyDirectFixedGeometryOwnership(win, node);
        setGeometryOnTarget(win, geometry || currentRect(win));
        if (!win.directPointerUp) {
          win.directPointerUp = () => persistGeometry(win);
          node.addEventListener("pointerup", win.directPointerUp, { passive: true });
        }
      } else {
        node.classList.remove("admin-native-direct-floating", "admin-native-maximized");
        [
          "position", "left", "top", "right", "bottom", "width", "height",
          "min-width", "max-width", "min-height", "max-height",
          "transform", "z-index"
        ].forEach(property => node.style.removeProperty(property));
      }
    }

    function bringToFront(win, persist = true) {
      if (!win?.floating) return;
      const target = win.directFixed ? win.anchor : win.shell;
      if (!target) return;
      zCounter += 1;
      setManagedFloatingStyle(win, target, "z-index", String(zCounter));
      if (persist) patchState(win.id, { z: zCounter });
    }

    function removeMinimizeBar(win) {
      if (!win) return;
      try { win.minimizeBarDragCleanup?.(); } catch {}
      win.minimizeBarDragCleanup = null;
      try { win.minimizeBarScoreObserver?.disconnect?.(); } catch {}
      win.minimizeBarScoreObserver = null;
      if (win.minimizeBar) win.minimizeBar.remove();
      win.minimizeBar = null;
      win.minimizeBarTitle = null;
      win.minimizeBarScore = null;
    }

    function floatingMinibarPosition(win, bar) {
      const state = getState(win.id);
      const rect = currentRect(win);
      const width = Math.min(340, Math.max(250, Number(state.minWidth) || 310));
      const height = 44;
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const x = clamp(VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vw - width - VIEWPORT_MARGIN), Number(state.minX ?? rect.x ?? VIEWPORT_MARGIN));
      const y = clamp(VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vh - height - VIEWPORT_MARGIN), Number(state.minY ?? rect.y ?? VIEWPORT_MARGIN));
      bar.style.setProperty("left", `${Math.round(x)}px`, "important");
      bar.style.setProperty("top", `${Math.round(y)}px`, "important");
      bar.style.setProperty("right", "auto", "important");
      bar.style.setProperty("bottom", "auto", "important");
      return { x, y, width, height };
    }

    function wireFloatingMinibarDrag(win, bar) {
      let drag = null;
      const cleanupWindow = () => {
        window.removeEventListener("pointermove", move, true);
        window.removeEventListener("pointerup", up, true);
        window.removeEventListener("pointercancel", up, true);
        window.removeEventListener("blur", up, true);
      };
      const move = event => {
        if (!drag || event.pointerId !== drag.pointerId) return;
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const rect = bar.getBoundingClientRect();
        const x = clamp(VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vw - rect.width - VIEWPORT_MARGIN), drag.x + event.clientX - drag.clientX);
        const y = clamp(VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, vh - rect.height - VIEWPORT_MARGIN), drag.y + event.clientY - drag.clientY);
        bar.style.setProperty("left", `${Math.round(x)}px`, "important");
        bar.style.setProperty("top", `${Math.round(y)}px`, "important");
        event.preventDefault();
      };
      const up = event => {
        if (!drag || (event?.pointerId != null && event.pointerId !== drag.pointerId)) return;
        const rect = bar.getBoundingClientRect();
        const full = win.geometry || currentRect(win);
        win.geometry = { ...full, x: rect.left, y: rect.top };
        patchState(win.id, { minX: rect.left, minY: rect.top, x: rect.left, y: rect.top, width: full.width, height: full.height });
        drag = null;
        cleanupWindow();
      };
      const down = event => {
        if (event.button !== 0 || event.target?.closest?.("button")) return;
        const rect = bar.getBoundingClientRect();
        drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: rect.left, y: rect.top };
        window.addEventListener("pointermove", move, true);
        window.addEventListener("pointerup", up, true);
        window.addEventListener("pointercancel", up, true);
        window.addEventListener("blur", up, true);
        try { bar.setPointerCapture?.(event.pointerId); } catch {}
        event.preventDefault();
      };
      bar.addEventListener("pointerdown", down);
      win.minimizeBarDragCleanup = () => {
        cleanupWindow();
        bar.removeEventListener("pointerdown", down);
      };
    }

    function ensureMinimizeBar(win) {
      if (win?.minimizeBar?.isConnected) return win.minimizeBar;
      const floatingCompact = !!win?.floating;
      const active = visibleEntry(win)?.node || win.anchor;
      let parent = active?.parentNode || null;
      let before = active || null;
      const marker = win.placeholders.get(active);
      if (!floatingCompact && marker?.parentNode) {
        parent = marker.parentNode;
        before = marker;
      }
      if (floatingCompact) {
        parent = document.body;
        before = null;
      }
      if (!parent) return null;

      const bar = document.createElement("div");
      bar.className = `admin-native-minibar admin-native-tone-${win.tone}${floatingCompact ? " is-floating-compact" : ""}`;
      bar.dataset.adminNativeMinibar = win.id;
      // 40.1.48 — compact restore bars must remain interactive even when
      // neighboring native windows overlap the same workspace area.
      bar.style.setProperty("position", floatingCompact ? "fixed" : "relative", "important");
      bar.style.setProperty("z-index", "2147481250", "important");
      bar.style.setProperty("pointer-events", "auto", "important");
      bar.style.setProperty("isolation", "isolate", "important");
      const title = document.createElement("strong");
      title.className = "admin-native-minibar-title";
      title.textContent = win.title;
      bar.append(title);

      if (win.id === "math-core") {
        const score = document.createElement("span");
        score.className = "admin-native-minibar-score";
        const source = document.getElementById("atlasMathRailScore");
        const sync = () => { score.textContent = String(source?.textContent || "—").trim() || "—"; };
        sync();
        bar.classList.add("has-live-score");
        bar.append(score);
        if (source && typeof MutationObserver === "function") {
          win.minimizeBarScoreObserver = new MutationObserver(sync);
          win.minimizeBarScoreObserver.observe(source, { childList: true, characterData: true, subtree: true });
        }
      }

      const restore = createButton("admin-native-minibar-restore", "+  Restaurer", `Restaurer ${win.title}`);
      const hide = createButton("admin-native-minibar-hide", "×", `Masquer ${win.title}`);
      restore.style.setProperty("pointer-events", "auto", "important");
      hide.style.setProperty("pointer-events", "auto", "important");
      restore.addEventListener("click", () => setMinimized(win, false));
      hide.addEventListener("click", () => setHidden(win, true));
      bar.append(restore, hide);
      if (before) parent.insertBefore(bar, before); else parent.appendChild(bar);
      win.minimizeBar = bar;
      win.minimizeBarTitle = title;

      if (floatingCompact) {
        floatingMinibarPosition(win, bar);
        wireFloatingMinibarDrag(win, bar);
        bringToFront(win, false);
      }
      return bar;
    }

    function applyPresentationState(win) {
      const suppressed = win.minimized || win.hidden;
      const dockedCompact = win.minimized && !win.hidden && !win.floating && supportsDockedCompact(win);

      if (dockedCompact) {
        removeMinimizeBar(win);
        activateDockedCompact(win);
        refreshControlState(win);
        return;
      }

      if (win.compactPresentationActive) deactivateDockedCompact(win, true);
      if (win.minimized && !win.hidden) ensureMinimizeBar(win);
      else removeMinimizeBar(win);

      if (win.floating && !win.directFixed && win.shell) {
        win.nodes.forEach(node => setNodeSuppressed(node, false));
        win.shell.hidden = suppressed;
      } else if (win.floating && win.directFixed) {
        setNodeSuppressed(win.anchor, suppressed);
      } else {
        win.nodes.forEach(node => setNodeSuppressed(node, suppressed));
      }

      refreshControlState(win);
    }

    function setMinimized(win, minimized, persist = true) {
      if (!win) return;
      if (minimized && win.maximized) setMaximized(win, false, false);
      if (minimized && win.hidden) win.hidden = false;
      if (minimized && win.floating) {
        const rect = currentRect(win);
        if (!win.geometry) win.geometry = rect;
        else win.geometry = { ...win.geometry, x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }
      if (!minimized && win.floating && win.minimizeBar?.isConnected) {
        const miniRect = win.minimizeBar.getBoundingClientRect();
        if (win.geometry) win.geometry = { ...win.geometry, x: miniRect.left, y: miniRect.top };
      }
      win.minimized = !!minimized;
      applyPresentationState(win);
      if (!win.minimized && win.floating && win.geometry) setGeometryOnTarget(win, win.geometry);
      if (persist) patchState(win.id, { minimized: win.minimized, hidden: win.hidden, x: win.geometry?.x, y: win.geometry?.y, width: win.geometry?.width, height: win.geometry?.height });
      updateDeck();
    }

    function setHidden(win, hidden, persist = true) {
      if (!win) return;
      const next = !!hidden;
      if (next) {
        if (win.maximized) setMaximized(win, false, false);
        if (win.compactPresentationActive) deactivateDockedCompact(win, true);
        if (win.floating) setFloating(win, false, false);
        win.minimized = false;
        removeMinimizeBar(win);
      }
      win.hidden = next;
      applyPresentationState(win);
      if (persist) patchState(win.id, { hidden: win.hidden, minimized: win.minimized, floating: win.floating });
      updateDeck();
    }

    function setFloating(win, floating, persist = true, geometry = null, options = {}) {
      if (!win) return;
      if (!!floating === win.floating && (floating ? (win.directFixed || win.shell) : true)) return;
      if (floating && win.compactPresentationActive) deactivateDockedCompact(win, true);

      if (!floating) {
        if (win.maximized) {
          win.maximized = false;
          const target = win.directFixed ? win.anchor : win.shell;
          target?.classList.remove("admin-native-maximized");
        }
        if (win.directFixed) setDirectFloating(win, false);
        else restoreShellNodes(win);
        win.floating = false;
        domainMask(win);
        applyPresentationState(win);
        refreshControlState(win);
        if (persist) patchState(win.id, { floating: false, maximized: false });
        updateDeck();
        return;
      }

      let preferredGeometry = null;
      if (!geometry && !win.geometry && typeof win.preferredFloatGeometry === "function") {
        try { preferredGeometry = win.preferredFloatGeometry({ domain: activeDomain, window: win }); } catch {}
      }
      const hadGeometry = !!win.geometry;
      const baseGeometry = clampWindowGeometry(win, geometry || win.geometry || preferredGeometry || currentRect(win));
      const autoFitShell = !win.directFixed
        && options.autoFitShell !== false
        && !hadGeometry
        && options.restorePersisted !== true;
      win.geometry = { ...baseGeometry };
      if (win.directFixed) setDirectFloating(win, true, baseGeometry);
      else buildShell(win, baseGeometry, { autoFit: autoFitShell });
      win.floating = true;
      if (!win.directFixed) syncPortalHost(win);
      domainMask(win);
      applyPresentationState(win);
      bringToFront(win, false);
      refreshControlState(win);
      if (persist) {
        patchState(win.id, {
          floating: true,
          x: win.geometry?.x ?? baseGeometry.x,
          y: win.geometry?.y ?? baseGeometry.y,
          width: win.geometry?.width ?? baseGeometry.width,
          height: win.geometry?.height ?? baseGeometry.height,
          z: Number((win.directFixed ? win.anchor : win.shell)?.style.zIndex) || zCounter
        });
      }
      updateDeck();
    }

    function setMaximized(win, maximized, persist = true) {
      if (!win) return;
      if (!maximized) {
        if (!win.maximized) return;
        win.maximized = false;
        const target = win.directFixed ? win.anchor : win.shell;
        target?.classList.remove("admin-native-maximized");
        const restoreFloating = win.restoreFloating;
        const restoreGeometry = win.restoreGeometry;
        if (restoreFloating) {
          if (!win.floating) setFloating(win, true, false, restoreGeometry);
          setGeometryOnTarget(win, restoreGeometry || win.geometry || currentRect(win));
        } else {
          setFloating(win, false, false);
        }
        win.restoreFloating = false;
        win.restoreGeometry = null;
        refreshControlState(win);
        if (persist) patchState(win.id, { maximized: false, restoreFloating: null, restoreGeometry: null });
        updateDeck();
        return;
      }

      win.restoreFloating = win.floating;
      win.restoreGeometry = win.floating ? { ...(win.geometry || currentRect(win)) } : null;
      if (win.minimized) setMinimized(win, false, false);
      if (!win.floating) setFloating(win, true, false, currentRect(win), { autoFitShell: false });
      win.maximized = true;
      const target = win.directFixed ? win.anchor : win.shell;
      target?.classList.add("admin-native-maximized");
      if (target) {
        if (win.directFixed) applyDirectFixedGeometryOwnership(win, target);
        setManagedFloatingStyle(win, target, "left", "1.5vw");
        setManagedFloatingStyle(win, target, "top", "1.5vh");
        setManagedFloatingStyle(win, target, "width", "97vw");
        setManagedFloatingStyle(win, target, "height", "97vh");
      }
      bringToFront(win, false);
      refreshControlState(win);
      if (persist) {
        patchState(win.id, {
          maximized: true,
          minimized: false,
          floating: true,
          restoreFloating: win.restoreFloating,
          restoreGeometry: win.restoreGeometry
        });
      }
      updateDeck();
    }

    function stateLabel(win) {
      if (win.hidden) return "MASQ";
      if (win.maximized) return "MAX";
      if (win.minimized) return "MIN";
      if (win.floating) return "LIBRE";
      return "ANCRÉE";
    }

    function focusWindow(win) {
      if (!win) return;
      if (win.hidden) setHidden(win, false);
      if (win.minimized) setMinimized(win, false);
      if (win.floating) bringToFront(win);
      else {
        const target = visibleEntry(win)?.node || win.anchor;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.classList.remove("admin-native-focus-pulse");
        if (target) {
          void target.offsetWidth;
          target.classList.add("admin-native-focus-pulse");
          target.addEventListener("animationend", () => target.classList.remove("admin-native-focus-pulse"), { once: true });
        }
      }
    }

    function updateDeck() {
      if (deckBatchDepth40314 > 0) {
        deckBatchPending40314 = true;
        return;
      }
      if (!deckList) return;
      // 40.3.14 — the Window Deck is an operator tool, not a live mirror.
      // When hidden, rebuilding every row only burns main-thread time.
      // setDeckOpen(true) rebuilds it once immediately before display.
      if (deck?.hidden) return;
      deckList.innerHTML = "";
      const entries = [...windows.values()];
      if (deckCount) deckCount.textContent = String(entries.length);
      entries.forEach(win => {
        const row = document.createElement("div");
        row.className = "admin-window-deck-row";
        const name = document.createElement("span");
        name.className = "admin-window-deck-name";
        name.textContent = win.title;
        const state = document.createElement("span");
        state.className = "admin-window-deck-state";
        state.textContent = stateLabel(win);
        const focus = createButton("admin-window-deck-action", "◎", "Afficher / mettre au premier plan");
        const dock = createButton("admin-window-deck-action", "⌂", "Raccrocher");
        const min = createButton("admin-window-deck-action", win.minimized ? "+" : "—", "Réduire / restaurer");
        const hide = createButton("admin-window-deck-action", win.hidden ? "↥" : "×", win.hidden ? "Rappeler" : "Masquer");
        focus.addEventListener("click", () => focusWindow(win));
        dock.addEventListener("click", () => setFloating(win, false));
        min.addEventListener("click", () => setMinimized(win, !win.minimized));
        hide.addEventListener("click", () => setHidden(win, !win.hidden));
        row.append(name, state, focus, dock, min, hide);
        deckList.appendChild(row);
      });
    }

    function withDeckBatch40314(callback) {
      deckBatchDepth40314 += 1;
      try {
        return callback();
      } finally {
        deckBatchDepth40314 = Math.max(0, deckBatchDepth40314 - 1);
        if (deckBatchDepth40314 === 0 && deckBatchPending40314) {
          deckBatchPending40314 = false;
          updateDeck();
        }
      }
    }

    function installDeck() {
      if (deck) return deck;
      deck = document.createElement("aside");
      deck.className = "admin-window-deck";
      deck.hidden = true;
      deck.setAttribute("aria-label", "Gestionnaire de fenêtres Administrator");
      const head = document.createElement("div");
      head.className = "admin-window-deck-head";
      const title = document.createElement("strong");
      title.textContent = "WINDOW DECK";
      deckCount = document.createElement("span");
      deckCount.className = "admin-window-deck-count";
      const close = createButton("admin-window-deck-close", "×", "Fermer le gestionnaire de fenêtres");
      close.addEventListener("click", () => setDeckOpen(false));
      head.append(title, deckCount, close);
      deckList = document.createElement("div");
      deckList.className = "admin-window-deck-list";
      deck.append(head, deckList);
      document.body.appendChild(deck);
      updateDeck();
      return deck;
    }

    function setDeckOpen(open) {
      installDeck();
      deck.hidden = !open;
      document.body.classList.toggle("admin-window-deck-open", open);
      updateDeck();
    }

    function toggleDeck() {
      installDeck();
      setDeckOpen(deck.hidden);
    }

    function setFree(free) {
      const enabled = !!free;
      document.body.classList.toggle("admin-native-free", enabled);
      writeStorage(layoutKey, enabled ? "1" : "0");
      document.dispatchEvent(new CustomEvent("erith:admin-window-layout", { detail: { free: enabled } }));
      return enabled;
    }

    function isFree() {
      return document.body.classList.contains("admin-native-free");
    }

    function setDomain(domain) {
      activeDomain = clean(domain || "crypto") || "crypto";
      writeStorage(domainKey, activeDomain);
      windows.forEach(win => {
        domainMask(win);
        if (win.floating && !win.directFixed) syncPortalHost(win);
        applyPresentationState(win);
      });
      updateDeck();
      return activeDomain;
    }

    function renameWindow(id, title) {
      const win = windows.get(id);
      if (!win) return false;
      win.title = clean(title) || win.title;
      win.anchor.dataset.adminNativeTitle = win.title;
      refreshControlState(win);
      updateDeck();
      return true;
    }

    function reset() {
      windows.forEach(win => {
        removeStorage(stateKey(win.id));
        if (win.maximized) {
          win.maximized = false;
          const target = win.directFixed ? win.anchor : win.shell;
          target?.classList.remove("admin-native-maximized");
        }
        if (win.minimized || win.hidden) {
          if (win.compactPresentationActive) deactivateDockedCompact(win, true);
          win.minimized = false;
          win.hidden = false;
          removeMinimizeBar(win);
          win.nodes.forEach(node => setNodeSuppressed(node, false));
        }
        if (win.floating) {
          if (win.directFixed) setDirectFloating(win, false);
          else restoreShellNodes(win);
          win.floating = false;
        }
        win.entries.forEach(entry => entry.node.classList.remove("admin-native-domain-inactive"));
        win.geometry = null;
        win.restoreGeometry = null;
        win.restoreFloating = false;
        applyPresentationState(win);
        refreshControlState(win);
      });
      updateDeck();
      document.dispatchEvent(new CustomEvent("erith:admin-window-reset"));
    }

    function cascade() {
      const floating = [...windows.values()].filter(win => win.floating && !win.maximized);
      if (!floating.length) return 0;
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      const width = Math.min(760, Math.max(MIN_WIDTH, vw * .56));
      const height = Math.min(560, Math.max(220, vh * .60));
      floating.forEach((win, index) => {
        const step = 30;
        const x = VIEWPORT_MARGIN + (index % 7) * step;
        const y = VIEWPORT_MARGIN + (index % 7) * step;
        const safe = clampWindowGeometry(win, { x, y, width, height: win.geometry?.height || height });
        win.geometry = safe;
        setGeometryOnTarget(win, safe);
        bringToFront(win, false);
        persistGeometry(win);
      });
      return floating.length;
    }

    // 40.2.20 — Workspace Profiles Foundation.
    // Profiles are a presentation-layer snapshot only. They do not own market
    // domain, Graph Context V7, Oracle state, selected assets or business data.
    // The profile layer can therefore capture/restore the Window Manager without
    // creating a second analytical-memory authority.
    function snapshot() {
      const state = {};
      windows.forEach((win, id) => {
        const rect = win.floating ? currentRect(win) : null;
        state[id] = {
          floating: win.floating === true,
          minimized: win.minimized === true,
          hidden: win.hidden === true,
          maximized: win.maximized === true,
          geometry: rect ? {
            x: Number(rect.x),
            y: Number(rect.y),
            width: Number(rect.width),
            height: Number(rect.height)
          } : null
        };
      });
      return {
        schema: "erith.admin.workspace.window-state.v1",
        windows: state
      };
    }

    function applySnapshot(rawSnapshot, options = {}) {
      return withDeckBatch40314(() => {
      const snapshotState = rawSnapshot && typeof rawSnapshot === "object" ? rawSnapshot : {};
      const source = snapshotState.windows && typeof snapshotState.windows === "object"
        ? snapshotState.windows
        : {};
      const persist = options.persist === true;
      const applied = [];

      windows.forEach((win, id) => {
        const saved = source[id];
        if (!saved || typeof saved !== "object") return;

        // Normalize every managed presentation state before applying the saved
        // one. All calls reuse the existing canonical state owners; no CSS or
        // geometry path is reimplemented by the profile feature.
        if (win.maximized) setMaximized(win, false, false);
        if (win.minimized) setMinimized(win, false, false);
        if (win.hidden) setHidden(win, false, false);
        if (win.floating) setFloating(win, false, false);

        const geometry = saved.geometry && typeof saved.geometry === "object"
          ? saved.geometry
          : null;
        if (saved.floating === true) {
          setFloating(win, true, false, geometry, {
            autoFitShell: false,
            restorePersisted: true
          });
        }
        if (saved.maximized === true) setMaximized(win, true, false);
        if (saved.minimized === true) setMinimized(win, true, false);
        if (saved.hidden === true) setHidden(win, true, false);

        if (persist) {
          const current = win.floating ? currentRect(win) : null;
          patchState(win.id, {
            floating: win.floating === true,
            minimized: win.minimized === true,
            hidden: win.hidden === true,
            maximized: win.maximized === true,
            x: current?.x,
            y: current?.y,
            width: current?.width,
            height: current?.height
          });
        }
        applied.push(id);
      });

      updateDeck();
      document.dispatchEvent(new CustomEvent("erith:admin-window-profile-applied", {
        detail: { ids: applied.slice(), persisted: persist }
      }));
      if (options.captureResult === false) {
        return {
          schema: "erith.admin.workspace.window-apply-result.v1",
          applied: applied.slice(),
          persisted: persist
        };
      }
      return snapshot();
      });
    }

    function persistedPresentationSnapshot() {
      const state = {};
      windows.forEach((win, id) => {
        const saved = getState(id);
        const geometry = [saved.x, saved.y, saved.width, saved.height].every(value => Number.isFinite(Number(value)))
          ? { x: Number(saved.x), y: Number(saved.y), width: Number(saved.width), height: Number(saved.height) }
          : null;
        state[id] = {
          floating: saved.floating === true,
          minimized: saved.minimized === true,
          hidden: saved.hidden === true,
          maximized: saved.maximized === true,
          geometry
        };
      });
      return { schema: "erith.admin.workspace.window-state.v1", windows: state };
    }

    function neutralPresentationSnapshot() {
      const state = {};
      windows.forEach((_win, id) => {
        state[id] = { floating: false, minimized: false, hidden: false, maximized: false, geometry: null };
      });
      return { schema: "erith.admin.workspace.window-state.v1", windows: state };
    }

    function neutralizePresentation() {
      return applySnapshot(neutralPresentationSnapshot(), {
        persist: false,
        captureResult: false
      });
    }

    function restorePersistedPresentation() {
      return withDeckBatch40314(() => {
        // 40.3.14 — one pass only. applySnapshot already normalizes any current
        // presentation before applying the saved one. The former extra global
        // neutralization doubled DOM moves and forced additional layout work.
        const result = applySnapshot(persistedPresentationSnapshot(), {
          persist: false,
          captureResult: false
        });
        // z-order is intentionally replayed from the persistent source without
        // writing anything back.
        windows.forEach(win => {
          if (!win.floating) return;
          const state = getState(win.id);
          if (!Number.isFinite(Number(state.z))) return;
          zCounter = Math.max(zCounter, Number(state.z));
          const target = win.directFixed ? win.anchor : win.shell;
          if (target) setManagedFloatingStyle(win, target, "z-index", String(Number(state.z)));
        });
        updateDeck();
        document.dispatchEvent(new CustomEvent("erith:admin-window-persisted-presentation-restored", {
          detail: { persisted: false, singlePass: true }
        }));
        return result;
      });
    }

    function init(options = {}) {
      const storedFree = readStorage(layoutKey, defaultFree ? "1" : "0") !== "0";
      setFree(storedFree);
      definitions.forEach(def => {
        const win = resolveDefinition(def);
        if (!win?.id || windows.has(win.id)) return;
        windows.set(win.id, win);
      });

      const storedDomain = readStorage(domainKey, activeDomain);
      setDomain(storedDomain || activeDomain);

      if (options.restorePersistedPresentation !== false) {
        restorePersistedPresentation();
      } else {
        neutralizePresentation();
      }
      return { count: windows.size, free: isFree(), domain: activeDomain };
    }

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      const maximized = [...windows.values()].reverse().find(win => win.maximized);
      if (maximized) {
        event.preventDefault();
        setMaximized(maximized, false);
        return;
      }
      if (deck && !deck.hidden) setDeckOpen(false);
    });

    return {
      init,
      get count() { return windows.size; },
      isFree,
      setFree,
      setDomain,
      renameWindow,
      reset,
      cascade,
      toggleDeck,
      setDeckOpen,
      getWindow: id => windows.get(id) || null,
      snapshot,
      applySnapshot,
      restorePersistedPresentation,
      neutralizePresentation,
      minimize: (id, value = true) => setMinimized(windows.get(id), value),
      hide: (id, value = true) => setHidden(windows.get(id), value),
      float: (id, value = true) => setFloating(windows.get(id), value),
      maximize: (id, value = true) => setMaximized(windows.get(id), value),
      focus: id => focusWindow(windows.get(id))
    };
  }

  const WINDOW_MANAGER_CONTRACT = Object.freeze({
    build: "40.3.01",
    base_build: "40.1.48",
    default_shell_portal: "document.body",
    explicit_portal_override_supported: true,
    dock_restore: "layout-preserving-placeholder-original-parent",
    layout_preserving_placeholders: true,
    reserved_placeholder_css_zero_override: false,
    multi_node_geometry: "visible-node-union",
    floating_shell_auto_fit: "first-detach-content-plus-chrome",
    floating_shell_height_cap: "viewport-minus-24px",
    floating_shell_overflow: "scroll-only-when-natural-height-exceeds-viewport",
    floating_shell_saved_geometry_respected: true,
    drag_pointer_event_owner: "window-capture-phase",
    drag_reparent_continuity: true,
    drag_pointer_capture_reacquire: true,
    drag_single_gesture_detach_move: true,
    floating_minimize_compact_bar: true,
    docked_minimize_restore_pointer_guard: true,
    docked_family_compact_representative: true,
    docked_family_compact_preserves_native_header: true,
    docked_family_compact_collapses_representative_details: true,
    docked_family_compact_restores_detail_open_state: true,
    floating_family_minimize_uses_historical_minibar: true,
    minimized_bar_overlap_safe_z_index: true,
    floating_minimize_drag_persists_position: true,
    math_core_compact_score_live: true,
    direct_fixed_auto_fit: false,
    direct_fixed_windows_use_shell: false,
    direct_fixed_position_owner: "inline-important",
    direct_fixed_geometry_owner: "inline-important",
    direct_fixed_z_order_owner: "inline-important",
    direct_fixed_dock_css_override_safe: true,
    floating_shell_z_order: "global-body",
    role_isolation_api_40312: true,
    init_restore_persisted_presentation_option: true,
    neutralize_presentation_without_persist: true,
    restore_persisted_presentation_without_persist: true,
    batched_deck_reflow_40314: true,
    one_deck_rebuild_per_multiwindow_transaction_40314: true,
    hidden_deck_rebuild_deferred_40314: true,
    role_transition_capture_snapshot_disabled_40314: true,
    restore_persisted_single_pass_40314: true
    ,drag_detach_auto_fit_disabled_40315: true
    ,placeholder_measurement_batch_40315: "all-reads-before-dom-writes"
    ,compact_family_placeholder_policy_40317: "anchor-marker-18px"
    ,preserve_full_placeholder_default_40317: true
    ,drag_detach_height_fit_40319: true
    ,drag_detach_height_fit_scope_40319: "shell-height-only-one-layout-pass"
    ,drag_detach_shell_visual_40319: "40.3.17-preserved"
    ,drag_detach_width_rewrite_40319: false
    ,drag_detach_observer_40319: false
    ,drag_detach_timer_40319: false
    ,native_first_detach_autofit_40320: true
    ,native_first_detach_autofit_owner_40320: "autoFitFloatingShell"
    ,native_first_detach_autofit_layout_passes_40320: 1
    ,legacy_stored_geometry_height_fallback_40320: true
    ,saved_workspace_reset_40320: false
    ,operator_first_drag_autofit_retired_40349: true
    ,operator_first_drag_geometry_owner_40349: "40.3.19-height-only-fit"
    ,persisted_restore_geometry_changed_40349: false
    ,placeholder_contract_changed_40349: false
    ,new_timer_40349: false
    ,new_observer_40349: false
    ,floating_surface_backdrop_blur_40315: false
    ,floating_surface_repeating_background_40315: false
    ,maximized_surface_40315: "97vw x 97vh"
  });

  window.ErithAdminWindowManager = Object.freeze({
    create: createManager,
    contract: WINDOW_MANAGER_CONTRACT
  });
})();
