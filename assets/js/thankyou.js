/* Thank-you page.
   - The construction video starts on its own (muted, as browsers require) with
     the sound and CC buttons top right.
   - The confetti fires once, when the tick at the top has finished drawing.
   - Testimonial videos: the hero player plus one tab per video. Add a video by
     adding an entry to TESTIMONIALS; the thumbnail strip rebuilds itself. */

var TESTIMONIALS = [
  { names: "Adam, Jessy, Charlotte and Noah", role: "Wonderlanders",
    desc: "The Brett family travels full time on the road in their 21ft Amaroo, a 2 bunk van, with their dog.",
    quote: "Dealing with Wonderland RV for us has been an amazing experience. You can\u2019t beat the sales, the support and the reliability of the van.",
    url: "https://youtu.be/amfJS4mC4ZQ", poster: "assets/img/thanks/tv-brett.jpg", thumb: "assets/img/thanks/tv-brett-thumb.jpg" },
  { names: "Jess and Doug", role: "Wonderlanders",
    desc: "Jess and Doug travel Australia full time with their three children in their XTR.",
    quote: "Every little tiny detail has been thought of. It was faultless from the get-go, and the whole process was seamless.",
    url: "https://youtu.be/yz8DaA1Q4hE", poster: "assets/img/thanks/tv-sandy.jpg", thumb: "assets/img/thanks/tv-sandy-thumb.jpg" }
];

/* Route-specific line under the heading. The form the visitor used leaves a
   note in sessionStorage ("wlThanks") before it redirects here. No note (a
   direct visit) gives the general line. Copy: THANK-YOU-PAGE-COPY.md, block 1.
   {layout}, {show}, {van} and {model} come from the form; if one is missing the
   line falls back to a neutral wording. Add a route by adding a case. */
(function () {
  var el = document.getElementById("tyMsg");
  if (!el) return;
  var info = null;
  try { info = JSON.parse(sessionStorage.getItem("wlThanks") || "null"); } catch (e) {}
  info = info || {};
  var CALL = "within one business day from 03\u00a09958\u00a06708";
  var type = (info.type || "").toLowerCase();
  var text = "";

  if (info.route === "event") {
    text = "Your VIP appointment at " + (info.show || "the show") + " is in. Our team will call you " + CALL + " to lock in a time with you at the show.";
  } else if (info.route === "layouts") {
    text = "Your enquiry about " + (info.layout ? "the " + info.layout : "your layout") + " is in. Our team will call you " + CALL + " to talk it through and answer anything the floor plan can\u2019t.";
  } else if (info.route === "stock") {
    text = "Your enquiry about " + (info.van || "the van") + " is in. Our team will call you " + CALL + " to talk about the van and when you can come and see it.";
  } else if (info.route === "brochure") {
    text = "Your " + (info.model ? info.model + " " : "") + "brochure is on its way to your inbox. Our team will also give you a call " + CALL + " in case you have questions.";
  } else if (info.route === "build") {
    text = "Your quote request is in. Our team will go through the layout and options you picked and call you " + CALL + " to talk it over. Your quote is also on its way to your inbox.";
  } else if (info.route === "enquiry") {
    if (type === "call back") text = "Your call back request is in. Our team will ring you " + CALL + ", so pick up when you see that number.";
    else if (type === "book a factory tour") text = "Your factory tour request is in. Our team will call you " + CALL + " to lock in a day that suits you, then we\u2019ll walk you through how your van gets built at Campbellfield.";
    else if (type === "get a quote") text = "Your quote request is in. Our team will go through the layout and options you picked and call you " + CALL + " to talk it over.";
    else if (type.indexOf("virtual") === 0) text = "Your virtual consult request is in. Our team will call you " + CALL + " to find a time that suits you, then walk you through the vans on screen from wherever you are.";
  }
  if (!text) text = "Our team will give you a call " + CALL + ", so if that number pops up, it\u2019s us.";
  el.textContent = text;
})();

(function () {
  var frame = document.getElementById("tyVideo");
  if (frame && typeof mountVideo === "function") {
    mountVideo(frame, frame.getAttribute("data-video"), frame.getAttribute("data-title"), { popup: true });
  }
  /* the confetti waits for the tick to finish drawing (the animation ends on .tk), with a fallback in case it never reports */
  if (typeof wlConfetti === "function") {
    var fired = false, tk = document.querySelector(".ty-top-ck .tk");
    var fire = function () { if (fired) return; fired = true; wlConfetti(document.body.getAttribute("data-confetti") || "burst"); };
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (tk && !still) { tk.addEventListener("animationend", fire); setTimeout(fire, 2200); }
    else setTimeout(fire, 350);
  }

  /* ----------------------------------------------- testimonial video hero -- */
  var poster = document.getElementById("tyTvPoster"), tabs = document.getElementById("tyTvTabs"),
      q = document.getElementById("tyTvQ"), now = document.getElementById("tyTvNow"),
      desc = document.getElementById("tyTvDesc"), playBtn = document.getElementById("tyTvPlay");
  if (!poster || !tabs || !TESTIMONIALS.length) return;
  var current = -1;
  var QMARK = '<svg class="qmark" viewBox="0 0 352 208" aria-hidden="true"><path d="M159 208H289L352 0H249ZM0 208H130L193 0H90Z"/></svg>';

  function show(i) {
    current = i;
    var t = TESTIMONIALS[i];
    poster.src = t.poster;
    q.innerHTML = QMARK;
    q.appendChild(document.createTextNode(t.quote + "\u201d"));
    now.innerHTML = "<span></span><b></b>";
    now.lastChild.textContent = t.names; now.firstChild.textContent = t.role || "";
    desc.textContent = t.desc || "";
    playBtn.setAttribute("aria-label", "Play video: " + t.names);
    [].forEach.call(tabs.children, function (b, k) { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
  }

  function ytId(u) { var m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/); return m && m[1]; }

  function play(opener) {
    var t = TESTIMONIALS[current], id = ytId(t.url);
    if (id && typeof openVideoPopup === "function") openVideoPopup(id, t.names + " testimonial", t.poster, opener);
  }
  playBtn.addEventListener("click", function (e) { e.stopPropagation(); play(playBtn); });
  /* the faded picture behind the text plays it too; the thumbnail strip does not, and neither does a click that is selecting text */
  var hero = document.getElementById("tyTv");
  if (hero) hero.addEventListener("click", function (e) {
    if (e.target.closest(".ty-tv-strip")) return;
    var sel = window.getSelection && window.getSelection().toString();
    if (sel) return;
    play(playBtn);
  });

  TESTIMONIALS.forEach(function (t, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "ty-tv-card"; b.setAttribute("role", "tab");
    b.setAttribute("aria-label", t.names);
    b.innerHTML = '<img alt="" loading="lazy"><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></i>';
    b.firstChild.src = t.thumb || t.poster;
    b.addEventListener("click", function () { if (i !== current) show(i); });   /* a thumbnail only selects */
    tabs.appendChild(b);
  });
  show(0);
})();

/* ----------------------------------------------- first chat to first trip -- */
(function () {
  var list = document.getElementById("tyPkList"), pic = document.getElementById("tyPkPic"), cap = document.getElementById("tyPkCap");
  if (!list || !pic || !cap) return;
  var btns = list.querySelectorAll("button"), imgs = pic.querySelectorAll("img"), cur = 0, timer = null, visible = false, stopped = false;
  function show(i) {
    cur = i;
    for (var k = 0; k < btns.length; k++) { btns[k].classList.toggle("on", k === i); btns[k].setAttribute("aria-selected", k === i ? "true" : "false"); }
    for (var m = 0; m < imgs.length; m++) imgs[m].classList.toggle("on", m === i);
    list.style.setProperty("--i", i);
    var b = btns[i];
    cap.classList.remove("in"); void cap.offsetWidth; cap.classList.add("in");
    cap.innerHTML = '<span class="ty-pk-n">' + b.querySelector(".ty-pk-n").textContent + "</span><h3>" + b.querySelector("h3").textContent + "</h3><p>" + b.getAttribute("data-p") + "</p>";
  }
  Array.prototype.forEach.call(btns, function (b, k) { b.addEventListener("click", function () { stopped = true; clearInterval(timer); show(k); }); });
  show(0);
  /* moves on by itself, only while it is on screen, and stops for good at the first click */
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tick() { if (!stopped && visible && !document.hidden) show((cur + 1) % btns.length); }
  if (!still) {
    timer = setInterval(tick, 5000);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.4 }).observe(pic);
    else visible = true;
  }
})();


/* ------------------------------------------------ phone: long reviews fold up -- */
(function () {
  var mq = window.matchMedia && window.matchMedia("(max-width: 900px)"), wall = document.getElementById("tyWall");
  if (!mq || !wall) return;
  function prep(card) {
    if (card.__tyRead) return; card.__tyRead = true;
    var q = card.querySelector("blockquote"); if (!q) return;
    q.classList.add("ty-clamp");
    if (q.scrollHeight <= q.clientHeight + 2) { q.classList.remove("ty-clamp"); return; }
    var b = document.createElement("button");
    b.type = "button"; b.className = "ty-rc-more"; b.textContent = "Read more"; b.setAttribute("aria-expanded", "false");
    b.addEventListener("click", function () {
      var folded = q.classList.toggle("ty-clamp");
      b.textContent = folded ? "Read more" : "Show less"; b.setAttribute("aria-expanded", String(!folded));
    });
    q.parentNode.insertBefore(b, q.nextSibling);
  }
  function scan() { if (!mq.matches) return; [].forEach.call(wall.querySelectorAll(".ty-rc"), prep); }
  if (window.MutationObserver) new MutationObserver(scan).observe(wall, { childList: true, subtree: true });
  window.addEventListener("load", scan); scan();
})();


/* Phones: "How a Wonderland RV is built" is a row of swipe cards (CSS, inside the 900px query). The three dots
   follow the swipe and the cards also move on by themselves every 4 s while the section is on screen; a touch or
   a tap on a dot holds them for 8 s. Desktop keeps the plain three columns and never runs any of this. */
(function () {
  var grid = document.querySelector(".ty-bq-grid"), dots = document.getElementById("tyBqDots");
  if (!grid || !dots || !window.matchMedia) return;
  var mq = window.matchMedia("(max-width: 900px)"), cards = grid.children, n = cards.length, cur = 0, hold = 0, visible = false;
  for (var i = 0; i < n; i++) { var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Show step " + (i + 1)); dots.appendChild(b); }
  function padL() { return parseFloat(getComputedStyle(grid).scrollPaddingLeft) || 0; }
  function idx() { var best = 0, bd = 1e9; for (var k = 0; k < n; k++) { var d = Math.abs(cards[k].offsetLeft - padL() - grid.scrollLeft); if (d < bd) { bd = d; best = k; } } return best; }
  function mark(k) { cur = k; for (var m = 0; m < n; m++) dots.children[m].classList.toggle("on", m === k); }
  function go(k) { grid.scrollTo({ left: cards[k].offsetLeft - padL(), behavior: "smooth" }); }
  var raf; grid.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { mark(idx()); }); }, { passive: true });
  ["touchstart", "pointerdown"].forEach(function (t) { grid.addEventListener(t, function () { hold = Date.now(); }, { passive: true }); });
  Array.prototype.forEach.call(dots.children, function (d, k) { d.addEventListener("click", function () { hold = Date.now(); go(k); }); });
  mark(0);
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) {
    setInterval(function () { if (mq.matches && visible && !document.hidden && Date.now() - hold > 8000) go((cur + 1) % n); }, 4000);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.5 }).observe(grid);
    else visible = true;
  }
})();
