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
     GitHub Pages has no server, so the enquiry form builds a mailto: URL.
     The address lives in the form's data-mailto attribute. Without JS the
     form's own action is a mailto too, so it still does something useful. */
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

      window.location.href = href;

      if (status) {
        status.hidden = false;
        status.className = "alert alert--ok";
        status.textContent = "Your email app should be opening with the message ready to send. If it does not, write to " + address + " directly.";
      }
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

  if (scrubbers.length && !reduced) {
    var ticking = false;

    var scrubberInfo = scrubbers.map(function (el) {
      var tallies = [].slice.call(el.querySelectorAll("[data-tally]")).map(function (out) {
        return {
          el: out,
          from: parseFloat(out.getAttribute("data-tally-from")),
          to: parseFloat(out.getAttribute("data-tally-to")),
          prefix: out.getAttribute("data-tally-prefix") || "",
          suffix: out.getAttribute("data-tally-suffix") || "",
          decimals: (out.getAttribute("data-tally-decimals") | 0)
        };
      });
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

        info.tallies.forEach(function (t) {
          var value = t.from + (t.to - t.from) * p;
          t.el.textContent = t.prefix +
            value.toLocaleString("en-US", {
              minimumFractionDigits: t.decimals,
              maximumFractionDigits: t.decimals
            }) + t.suffix;
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
