(function () {
  "use strict";

  var WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

  var catalog = JSON.parse(document.getElementById("special-order-data").textContent);

  if (catalog.web3formsAccessKey === "REPLACE-WITH-YOUR-WEB3FORMS-ACCESS-KEY") {
    console.warn("Special Order form: web3formsAccessKey in specialOrder.json is still a placeholder — submissions will fail until it's replaced with a real key from web3forms.com.");
  }

  var state = {
    dips: {},
    pitas: {},
    fulfil: "market",
    submitting: false
  };

  catalog.dips.forEach(function (dip) {
    state.dips[dip.key] = [{ size: dip.sizes[0].value, qty: 0 }];
  });
  catalog.pitas.forEach(function (pita) {
    state.pitas[pita.key] = 0;
  });

  var els = {
    dips: document.getElementById("so-dips"),
    pitas: document.getElementById("so-pitas"),
    badgeMinimum: document.getElementById("so-badge-minimum"),
    badgeLeadtime: document.getElementById("so-badge-leadtime"),
    badgeDeposit: document.getElementById("so-badge-deposit"),
    totalValue: document.getElementById("so-total-value"),
    status: document.getElementById("so-status"),
    submit: document.getElementById("so-submit"),
    error: document.getElementById("so-error"),
    form: document.getElementById("so-form"),
    confirmation: document.getElementById("so-confirmation"),
    confirmSummary: document.getElementById("so-confirm-summary"),
    reset: document.getElementById("so-reset"),
    pickMarket: document.getElementById("so-pick-market"),
    pickDelivery: document.getElementById("so-pick-delivery"),
    whereLabel: document.getElementById("so-where-label"),
    where: document.getElementById("so-where"),
    name: document.getElementById("so-name"),
    phone: document.getElementById("so-phone"),
    email: document.getElementById("so-email"),
    date: document.getElementById("so-date"),
    notes: document.getElementById("so-notes"),
    requests: document.getElementById("so-requests")
  };

  function money(n) {
    return "$" + n.toLocaleString("en-US");
  }

  function priceOf(def, size) {
    var hit = def.sizes.filter(function (s) { return s.value === size; })[0];
    return hit ? hit.price : 0;
  }
  function labelOf(def, size) {
    var hit = def.sizes.filter(function (s) { return s.value === size; })[0];
    return hit ? hit.label : "";
  }

  function total() {
    var t = 0;
    catalog.dips.forEach(function (dip) {
      state.dips[dip.key].forEach(function (entry) {
        t += priceOf(dip, entry.size) * entry.qty;
      });
    });
    catalog.pitas.forEach(function (pita) {
      t += pita.price * state.pitas[pita.key];
    });
    return t;
  }

  function summaryLines() {
    var parts = [];
    catalog.dips.forEach(function (dip) {
      state.dips[dip.key].forEach(function (entry) {
        if (entry.qty) parts.push(entry.qty + " × " + dip.name + " (" + labelOf(dip, entry.size) + ")");
      });
    });
    catalog.pitas.forEach(function (pita) {
      var q = state.pitas[pita.key];
      if (q) parts.push(q + " × " + pita.name + " (dozen)");
    });
    return parts;
  }

  function clampQty(n) {
    return Math.max(0, Math.min(99, n));
  }

  function renderDips() {
    els.dips.innerHTML = "";
    catalog.dips.forEach(function (dip) {
      var entries = state.dips[dip.key];
      var card = document.createElement("div");
      card.className = "so-dip-card";

      var head = document.createElement("div");
      head.className = "so-dip-card-head";

      var nameGroup = document.createElement("div");
      nameGroup.className = "so-dip-name-group";
      var name = document.createElement("div");
      name.className = "so-dip-name";
      name.textContent = dip.name;
      nameGroup.appendChild(name);
      if (dip.hot) {
        var hotBadge = document.createElement("div");
        hotBadge.className = "so-hot-badge";
        hotBadge.textContent = "Hot";
        nameGroup.appendChild(hotBadge);
      }
      head.appendChild(nameGroup);

      var addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "so-add-size-btn";
      addBtn.textContent = "+ Add another size";
      var canAdd = entries.length < dip.sizes.length;
      addBtn.disabled = !canAdd;
      addBtn.addEventListener("click", function () {
        var used = entries.map(function (e) { return e.size; });
        var free = dip.sizes.filter(function (s) { return used.indexOf(s.value) < 0; })[0];
        entries.push({ size: free ? free.value : dip.sizes[0].value, qty: 1 });
        rerender();
      });
      head.appendChild(addBtn);
      card.appendChild(head);

      entries.forEach(function (entry, i) {
        var row = document.createElement("div");
        row.className = "so-entry-row";

        var select = document.createElement("select");
        select.className = "so-entry-select";
        dip.sizes.forEach(function (opt) {
          var optionEl = document.createElement("option");
          optionEl.value = opt.value;
          optionEl.textContent = opt.label + " — " + money(opt.price);
          if (opt.value === entry.size) optionEl.selected = true;
          select.appendChild(optionEl);
        });
        select.addEventListener("change", function () {
          entry.size = select.value;
          rerender();
        });
        row.appendChild(select);

        var stepper = document.createElement("div");
        stepper.className = "so-stepper";
        var dec = document.createElement("button");
        dec.type = "button";
        dec.className = "so-stepper-btn";
        dec.setAttribute("aria-label", "Fewer");
        dec.textContent = "–";
        dec.addEventListener("click", function () {
          entry.qty = clampQty(entry.qty - 1);
          rerender();
        });
        var qtyEl = document.createElement("div");
        qtyEl.className = "so-stepper-qty";
        qtyEl.textContent = String(entry.qty);
        var inc = document.createElement("button");
        inc.type = "button";
        inc.className = "so-stepper-btn";
        inc.setAttribute("aria-label", "More");
        inc.textContent = "+";
        inc.addEventListener("click", function () {
          entry.qty = clampQty(entry.qty + 1);
          rerender();
        });
        stepper.appendChild(dec);
        stepper.appendChild(qtyEl);
        stepper.appendChild(inc);
        row.appendChild(stepper);

        var lineTotal = document.createElement("div");
        var lineAmount = priceOf(dip, entry.size) * entry.qty;
        lineTotal.className = "so-line-total " + (entry.qty ? "has-qty" : "no-qty");
        lineTotal.textContent = entry.qty ? money(lineAmount) : "—";
        row.appendChild(lineTotal);

        if (entries.length > 1) {
          var removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "so-remove-btn";
          removeBtn.setAttribute("aria-label", "Remove this size");
          removeBtn.textContent = "×";
          removeBtn.addEventListener("click", function () {
            state.dips[dip.key] = entries.filter(function (_, j) { return j !== i; });
            rerender();
          });
          row.appendChild(removeBtn);
        }

        card.appendChild(row);
      });

      els.dips.appendChild(card);
    });
  }

  function renderPitas() {
    els.pitas.innerHTML = "";
    catalog.pitas.forEach(function (pita) {
      var qty = state.pitas[pita.key];
      var row = document.createElement("div");
      row.className = "so-pita-row";

      var name = document.createElement("div");
      name.className = "so-pita-name";
      name.textContent = pita.name;
      row.appendChild(name);

      var unit = document.createElement("div");
      unit.className = "so-pita-unit";
      unit.textContent = money(pita.price) + " / " + pita.unit;
      row.appendChild(unit);

      var stepper = document.createElement("div");
      stepper.className = "so-stepper";
      var dec = document.createElement("button");
      dec.type = "button";
      dec.className = "so-stepper-btn";
      dec.setAttribute("aria-label", "Fewer");
      dec.textContent = "–";
      dec.addEventListener("click", function () {
        state.pitas[pita.key] = clampQty(qty - 1);
        rerender();
      });
      var qtyEl = document.createElement("div");
      qtyEl.className = "so-stepper-qty";
      qtyEl.textContent = String(qty);
      var inc = document.createElement("button");
      inc.type = "button";
      inc.className = "so-stepper-btn";
      inc.setAttribute("aria-label", "More");
      inc.textContent = "+";
      inc.addEventListener("click", function () {
        state.pitas[pita.key] = clampQty(qty + 1);
        rerender();
      });
      stepper.appendChild(dec);
      stepper.appendChild(qtyEl);
      stepper.appendChild(inc);
      row.appendChild(stepper);

      var lineTotal = document.createElement("div");
      var lineAmount = pita.price * qty;
      lineTotal.className = "so-line-total " + (qty ? "has-qty" : "no-qty");
      lineTotal.textContent = qty ? money(lineAmount) : "—";
      row.appendChild(lineTotal);

      els.pitas.appendChild(row);
    });
  }

  function renderTotalPanel() {
    var t = total();
    var count = summaryLines().length;
    var ok = t >= catalog.minimum;

    els.totalValue.textContent = money(t);

    if (!count) {
      els.status.textContent = "Nothing added yet. Prices are firm for listed sizes; we confirm your total by email within one business day.";
    } else if (!ok) {
      els.status.textContent = count + (count === 1 ? " item" : " items") + " — " + money(catalog.minimum - t) + " below the $" + catalog.minimum + " minimum.";
    } else {
      els.status.textContent = count + (count === 1 ? " item" : " items") + ". We confirm your total by email within one business day — nothing is charged until you approve it.";
    }

    els.submit.disabled = !ok || state.submitting;
  }

  function renderFulfil() {
    var isMarket = state.fulfil === "market";
    els.pickMarket.classList.toggle("is-active", isMarket);
    els.pickDelivery.classList.toggle("is-active", !isMarket);
    els.whereLabel.textContent = isMarket ? "Which market" : "Delivery address";
  }

  function renderBadges() {
    els.badgeMinimum.textContent = money(catalog.minimum) + " per order";
    els.badgeLeadtime.textContent = catalog.leadTimeShort + " · " + catalog.leadTimeLong;
    els.badgeDeposit.textContent = catalog.depositPercent + "% over " + money(catalog.depositThreshold);
  }

  function rerender() {
    renderDips();
    renderPitas();
    renderTotalPanel();
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.hidden = false;
  }
  function clearError() {
    els.error.hidden = true;
    els.error.textContent = "";
  }

  els.pickMarket.addEventListener("click", function () {
    state.fulfil = "market";
    renderFulfil();
    clearError();
  });
  els.pickDelivery.addEventListener("click", function () {
    state.fulfil = "delivery";
    renderFulfil();
    clearError();
  });

  els.reset.addEventListener("click", function () {
    catalog.dips.forEach(function (dip) {
      state.dips[dip.key] = [{ size: dip.sizes[0].value, qty: 0 }];
    });
    catalog.pitas.forEach(function (pita) {
      state.pitas[pita.key] = 0;
    });
    state.fulfil = "market";
    state.submitting = false;
    els.name.value = "";
    els.phone.value = "";
    els.email.value = "";
    els.date.value = "";
    els.where.value = "";
    els.notes.value = "";
    els.requests.value = "";
    clearError();
    renderFulfil();
    rerender();
    els.confirmation.hidden = true;
    els.form.hidden = false;
  });

  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var t = total();
    var lines = summaryLines();
    var name = els.name.value.trim();
    var phone = els.phone.value.trim();
    var email = els.email.value.trim();
    var date = els.date.value;
    var where = els.where.value.trim();

    if (!t) return showError("Add at least one item to your order.");
    if (t < catalog.minimum) return showError("Orders start at " + money(catalog.minimum) + " — you are " + money(catalog.minimum - t) + " short.");
    if (!name || !phone || !email || !date) return showError("Please fill in your name, phone, email, and the date you need it.");
    if (!where) return showError(state.fulfil === "market" ? "Which market should we bring it to?" : "We need a delivery address.");

    var summaryText = lines.join(" | ") + " — estimated " + money(t);

    state.submitting = true;
    renderTotalPanel();
    els.submit.textContent = "Sending…";

    fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: catalog.web3formsAccessKey,
        subject: "Special Order request — Sharav",
        from_name: "Sharav Special Order Form",
        name: name,
        phone: phone,
        email: email,
        needed_by: date,
        fulfillment: state.fulfil,
        where: where,
        order_summary: lines.join(" | "),
        estimated_total: money(t),
        special_requests: els.requests.value.trim(),
        allergies_notes: els.notes.value.trim(),
        message: "Order: " + lines.join(", ") + "\nEstimated total: " + money(t) + "\nFulfillment: " + state.fulfil + " — " + where + "\nNeeded by: " + date
      })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok || !data.success) {
            throw new Error((data && data.message) || "Request failed (" + res.status + ")");
          }
          return data;
        });
      })
      .then(function () {
        state.submitting = false;
        els.confirmSummary.textContent = summaryText;
        els.form.hidden = true;
        els.confirmation.hidden = false;
      })
      .catch(function (err) {
        state.submitting = false;
        els.submit.textContent = "Request this order";
        renderTotalPanel();
        showError("Something went wrong sending your order — please try again, or reach us directly at " + catalog.phone + " or " + catalog.email + ".");
        console.error("Special Order submit failed:", err);
      });
  });

  renderBadges();
  renderFulfil();
  rerender();
})();
