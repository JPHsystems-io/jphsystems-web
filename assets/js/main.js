/* JPHsystems — site behaviour.
   Vanilla JS, no dependencies. Safe to load with `defer`. */
(function () {
  "use strict";

  /* ── Mobile navigation ───────────────────────────────────────────────── */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ── Theme toggle ─────────────────────────────────────────────────────── */
  var themeToggle = document.querySelector("[data-theme-toggle]");
  if (themeToggle) {
    var applyTheme = function (theme) {
      var root = document.documentElement;
      root.setAttribute("data-theme", theme);
      var light = theme === "light";
      themeToggle.setAttribute("aria-pressed", String(light));
      themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", light ? "#f6f7f9" : "#11171f");
    };
    applyTheme(document.documentElement.getAttribute("data-theme") || "dark");

    themeToggle.addEventListener("click", function () {
      var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
      applyTheme(next);
    });
  }

  /* ── Header background on scroll ─────────────────────────────────────── */
  var header = document.querySelector(".site-header");
  if (header) {
    var tickingHeader = false;
    var onHeaderScroll = function () {
      if (!tickingHeader) {
        window.requestAnimationFrame(function () {
          header.classList.toggle("is-stuck", window.scrollY > 8);
          tickingHeader = false;
        });
        tickingHeader = true;
      }
    };
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ── Depth: hero progress pushes the diagram toward the camera ──────────
     One property on <html>, read by CSS for both the hero copy (which drifts
     slower) and the diagram (which grows and passes you). */
  var heroEl = document.querySelector(".hero");
  var flowPlane = document.querySelector(".flow-plane");

  if (heroEl && flowPlane) {
    var heroTicking = false;
    var onHeroScroll = function () {
      if (heroTicking) return;
      heroTicking = true;
      window.requestAnimationFrame(function () {
        var rect = heroEl.getBoundingClientRect();
        var span = Math.max(1, rect.height * 0.85);
        var progress = Math.min(1, Math.max(0, -rect.top / span));
        document.documentElement.style.setProperty("--hero-p", progress.toFixed(4));
        heroTicking = false;
      });
    };
    window.addEventListener("scroll", onHeroScroll, { passive: true });
    window.addEventListener("resize", onHeroScroll, { passive: true });
    onHeroScroll();
  }

  /* ── Reveal on scroll ────────────────────────────────────────────────── */
  var reveals = document.querySelectorAll("[data-reveal]");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reveals.length && "IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ── Current year in footer ──────────────────────────────────────────── */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ── Form validation and mailto composition ────────────────────────────
     There is no server and no relay: the enquiry form builds a mailto: URL
     and the visitor's own mail client sends it. The address lives in the
     form's data-mailto attribute; without JS the form's own action is a
     mailto too, so it still does something useful. */
  var showError = function (input, message) {
    var box = document.getElementById(input.id + "-error");
    input.setAttribute("aria-invalid", "true");
    if (box) box.textContent = message;
  };
  var clearError = function (input) {
    var box = document.getElementById(input.id + "-error");
    input.removeAttribute("aria-invalid");
    if (box) box.textContent = "";
  };
  var fieldValue = function (input) {
    return input.type === "checkbox" ? (input.checked ? "on" : "") : input.value.trim();
  };

  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    var fields = form.querySelectorAll("input[required], textarea[required], select[required], input[type='email']");
    var status = form.querySelector("[data-form-status]");

    fields.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (fieldValue(input) !== "") clearError(input);
      });
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true" && input.checkValidity()) clearError(input);
      });
    });

    form.addEventListener("submit", function (e) {
      var firstBad = null;

      fields.forEach(function (input) {
        clearError(input);
        var value = fieldValue(input);

        if (input.hasAttribute("required") && value === "") {
          if (input.type === "checkbox") {
            showError(input, "Please confirm before sending.");
          } else {
            showError(input, "This field is required.");
          }
          firstBad = firstBad || input;
        } else if (input.type === "email" && value !== "" && !input.checkValidity()) {
          showError(input, "Enter a valid email address.");
          firstBad = firstBad || input;
        }
      });

      if (firstBad) {
        e.preventDefault();
        firstBad.focus();
        return;
      }

      var address = form.getAttribute("data-mailto");
      if (!address) return;

      e.preventDefault();

      var name = (form.querySelector("[name='name']") || {}).value || "";
      var email = (form.querySelector("[name='email']") || {}).value || "";
      var company = (form.querySelector("[name='company']") || {}).value || "";
      var topic = (form.querySelector("[name='topic']") || {}).value || "";
      var message = (form.querySelector("[name='message']") || {}).value || "";

      var subject = "Enquiry" + (topic ? " — " + topic : "") + (company ? " — " + company : "");
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        (company ? "Company: " + company + "\n" : "") +
        (topic ? "Topic: " + topic + "\n" : "") +
        "\n" + message + "\n";

      var href = "mailto:" + address +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      /* No relay, no server: the message is composed in the visitor's own mail
         client and sent from there. The draft link stays on screen so it can be
         reopened when no mail handler answers the first click. */
      window.location.href = href;

      if (!status) return;
      status.hidden = false;
      status.className = "alert alert--ok";
      status.textContent = "";
      status.appendChild(document.createTextNode(
        "Your email app should be opening with the message ready to send. "
      ));

      var draftLink = document.createElement("a");
      draftLink.href = href;
      draftLink.className = "text-link";
      draftLink.textContent = "Open the draft again";
      status.appendChild(draftLink);

      status.appendChild(document.createTextNode(". If nothing opens, write to "));
      var directLink = document.createElement("a");
      directLink.href = "mailto:" + address;
      directLink.className = "text-link";
      directLink.textContent = address;
      status.appendChild(directLink);
      status.appendChild(document.createTextNode(
        " — your text is still in the form."
      ));
    });
  });

  /* ── Preselect the enquiry topic from ?topic= ─────────────────────────── */
  var topicParam = null;
  try {
    topicParam = new URLSearchParams(window.location.search).get("topic");
  } catch (e) { /* very old browser: leave the select alone */ }

  if (topicParam) {
    var topicSelect = document.querySelector("form[data-validate] select[name='topic']");
    if (topicSelect) {
      [].slice.call(topicSelect.options).forEach(function (option) {
        if (option.value.toLowerCase() === topicParam.toLowerCase()) {
          topicSelect.value = option.value;
        }
      });
    }
  }
})();

/* ===========================================================================
   Motion layer
   A scroll-progress publisher that hands values to CSS through a custom
   property, plus count-up numbers. Skipped under prefers-reduced-motion.
   =========================================================================== */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Scroll progress → CSS custom property ───────────────────────────── */
  var scrubbers = [].slice.call(document.querySelectorAll("[data-scrub]"));

  /* Formats one scrubbed number for a given progress (0–1). */
  var paintTally = function (out, p) {
    var from = parseFloat(out.getAttribute("data-tally-from"));
    var to = parseFloat(out.getAttribute("data-tally-to"));
    var decimals = (out.getAttribute("data-tally-decimals") | 0);
    out.textContent = (out.getAttribute("data-tally-prefix") || "") +
      (from + (to - from) * p).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + (out.getAttribute("data-tally-suffix") || "");
  };

  if (scrubbers.length && !reduced) {
    var ticking = false;

    var scrubberInfo = scrubbers.map(function (el) {
      var tallies = [].slice.call(el.querySelectorAll("[data-tally]"));
      return { el: el, tallies: tallies };
    });

    var update = function () {
      var vh = window.innerHeight;

      scrubberInfo.forEach(function (info) {
        var rect = info.el.getBoundingClientRect();
        var span = rect.height - vh;
        var p;

        if (span > 0) {
          p = -rect.top / span;
        } else {
          p = (vh - rect.top) / (vh + rect.height);
        }

        p = Math.max(0, Math.min(1, p));
        info.el.style.setProperty("--p", p.toFixed(4));

        info.tallies.forEach(function (out) {
          paintTally(out, p);
        });
      });

      ticking = false;
    };

    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  } else {
    /* Reduced motion, or no scrub sections: show the end state so the
       numbers agree with the captions next to them. */
    [].slice.call(document.querySelectorAll("[data-tally]")).forEach(function (el) {
      paintTally(el, 1);
    });
  }

  /* ── Count-up numbers ────────────────────────────────────────────────── */
  var counters = [].slice.call(document.querySelectorAll("[data-count-to]"));

  var runCount = function (el) {
    var to = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-count-suffix") || "";
    var prefix = el.getAttribute("data-count-prefix") || "";
    var decimals = (el.getAttribute("data-count-decimals") | 0);
    var duration = 1500;
    var started = null;

    var step = function (now) {
      if (started === null) started = now;
      var t = Math.min(1, (now - started) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + (to * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (counters.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        el.textContent = (el.getAttribute("data-count-prefix") || "") +
          el.getAttribute("data-count-to") +
          (el.getAttribute("data-count-suffix") || "");
      });
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          co.unobserve(entry.target);
        });
      }, { threshold: 0.5 });

      counters.forEach(function (el) {
        el.textContent = (el.getAttribute("data-count-prefix") || "") +
          "0" + (el.getAttribute("data-count-suffix") || "");
        co.observe(el);
      });
    }
  }

  /* ── Charts and dials animate when their panel scrolls in ─────────────── */
  var visuals = [].slice.call(document.querySelectorAll(".ui-chart, .dial"));

  if (visuals.length) {
    if (!("IntersectionObserver" in window)) {
      visuals.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var vo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          vo.unobserve(entry.target);
        });
      }, { threshold: 0.35 });
      visuals.forEach(function (el) { vo.observe(el); });
    }
  }


  /* ── Depth: pointer tilt and scroll attitude ─────────────────────────────
     The 3D is decoration, so it only runs where there is a real pointer and
     no reduced-motion preference. CSS does the transforms; this only writes
     the custom properties it needs. */
  var depthQuery = window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)");
  var stillMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var initDepth = function () {
    var flow = document.querySelector(".flow");
    var hero = document.querySelector(".hero");

    if (flow && hero) {
      var heroPointer = function (e) {
        var rect = flow.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        flow.classList.add("is-tilting");
        flow.style.setProperty("--pt-x", (-y * 7).toFixed(2) + "deg");
        flow.style.setProperty("--pt-y", (x * 9).toFixed(2) + "deg");
      };
      var heroReset = function () {
        flow.classList.remove("is-tilting");
        flow.style.setProperty("--pt-x", "0deg");
        flow.style.setProperty("--pt-y", "0deg");
      };

      hero.addEventListener("pointermove", heroPointer, { passive: true });
      hero.addEventListener("pointerleave", heroReset);

      /* As the hero leaves, the plane lies down a little. */
      var scrollFrame = false;
      var onDepthScroll = function () {
        if (scrollFrame) return;
        scrollFrame = true;
        window.requestAnimationFrame(function () {
          var rect = hero.getBoundingClientRect();
          var progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
          flow.style.setProperty("--sc-x", (progress * 7).toFixed(2) + "deg");
          scrollFrame = false;
        });
      };
      window.addEventListener("scroll", onDepthScroll, { passive: true });
      onDepthScroll();
    }

    var tiltables = document.querySelectorAll(".card, .aside-card, .panel, .cta-band");
    [].forEach.call(tiltables, function (card) {
      var maxX = 4.6;
      var maxY = 5.4;

      card.classList.add("tiltable");

      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.classList.add("is-tilting");
        /* Inline so it beats the stylesheet's own hover transform. */
        card.style.transform =
          "perspective(1000px) rotateX(" + (-y * maxX).toFixed(2) + "deg)" +
          " rotateY(" + (x * maxY).toFixed(2) + "deg) translateZ(0)";
      }, { passive: true });

      card.addEventListener("pointerleave", function () {
        card.classList.remove("is-tilting");
        card.style.removeProperty("transform");
      });
    });
  };

  var depthEnabled = false;
  var syncDepth = function () {
    var wanted = depthQuery.matches && !stillMotion.matches;
    if (wanted === depthEnabled) return;
    depthEnabled = wanted;

    if (wanted) {
      initDepth();
    } else {
      document.querySelectorAll(".tiltable").forEach(function (el) {
        el.classList.remove("tiltable", "is-tilting");
        el.style.removeProperty("transform");
      });
      var flowEl = document.querySelector(".flow");
      if (flowEl) {
        flowEl.classList.remove("is-tilting");
        ["--pt-x", "--pt-y", "--sc-x"].forEach(function (prop) {
          flowEl.style.removeProperty(prop);
        });
      }
    }
  };

  if ("matchMedia" in window) {
    syncDepth();
    if (depthQuery.addEventListener) {
      depthQuery.addEventListener("change", function () { depthEnabled = false; syncDepth(); });
      stillMotion.addEventListener("change", function () { depthEnabled = false; syncDepth(); });
    } else if (depthQuery.addListener) {
      depthQuery.addListener(function () { depthEnabled = false; syncDepth(); });
      stillMotion.addListener(function () { depthEnabled = false; syncDepth(); });
    }
  }

  /* ── Marquee: duplicate the track so the loop is seamless ─────────────── */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ── Flow paths: measure each path so the draw-in dash matches its length ── */
  document.querySelectorAll(".flow-path").forEach(function (path) {
    try {
      var len = Math.ceil(path.getTotalLength());
      path.style.setProperty("--len", len);
    } catch (e) { /* older engines: the CSS fallback length is close enough */ }
  });
})();
