/* ==========================================================================
   Footer link groups become an accordion on a phone.
   Its own file: the homepage and the contact page carry the same footer, so
   neither page's script owns it.

   As one column the five groups run 982 tall -- just under half the footer.
   Closed, the same five headings are 266.
   ========================================================================== */
(function () {
  if (!window.matchMedia("(max-width: 900px)").matches) return;
  const cols = document.querySelector(".link-cols");
  if (!cols) return;

  /* Collect the heading/list pairs before touching anything. The transform
     moves nodes out of their column, and walking a live child list while
     mutating it drops every second pair. */
  const pairs = [];
  [].forEach.call(cols.querySelectorAll(".link-col"), function (col) {
    [].forEach.call(col.querySelectorAll("h4"), function (head) {
      const list = head.nextElementSibling;
      if (list && list.tagName === "UL") pairs.push({ col: col, head: head, list: list });
    });
  });
  if (!pairs.length) return;

  pairs.forEach(function (p) {
    const row = document.createElement("div");
    row.className = "foot-acc";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "foot-acc-head";
    btn.setAttribute("aria-expanded", "false");

    /* .footer-head but never .footer-head--gap: the rows carry their own
       rhythm, and the 32 top margin would double the rule spacing. */
    const label = document.createElement("span");
    label.className = "footer-head";
    label.textContent = p.head.textContent.trim();

    const sign = document.createElement("span");
    sign.className = "foot-acc-sign";
    sign.setAttribute("aria-hidden", "true");

    btn.appendChild(label);
    btn.appendChild(sign);

    const body = document.createElement("div");
    body.className = "foot-acc-body";

    p.col.insertBefore(row, p.head);
    row.appendChild(btn);
    row.appendChild(body);
    body.appendChild(p.list);          // the real list, moved rather than copied
    p.head.remove();
  });

  cols.addEventListener("click", function (e) {
    const btn = e.target.closest(".foot-acc-head");
    if (!btn) return;
    const row = btn.parentElement, body = row.querySelector(".foot-acc-body");
    const open = row.classList.contains("is-on");

    /* Animated from a measured number: `auto` does not transition, and a grid
       0fr -> 1fr resolves to zero inside an auto-height parent -- both of which
       cost an afternoon on the homepage accordions already. */
    body.style.height = body.scrollHeight + "px";
    if (open) {
      requestAnimationFrame(function () { body.style.height = "0px"; });
      row.classList.remove("is-on");
      btn.setAttribute("aria-expanded", "false");
    } else {
      row.classList.add("is-on");
      btn.setAttribute("aria-expanded", "true");
      /* released to auto once open, so a window resize cannot clip it */
      setTimeout(function () {
        if (row.classList.contains("is-on")) body.style.height = "auto";
      }, 320);
    }
  });
})();
