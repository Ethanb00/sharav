(function () {
  "use strict";

  var cfg = window.SHARAV_EDITOR_CONFIG;
  var gh = window.SharavGitHub;

  var token = null;
  var htmlSha = null;
  var cssSha = null;
  var gjsEditor = null;

  var gate = document.getElementById("gate");
  var gateStatus = document.getElementById("gate-status");
  var loginBtn = document.getElementById("login-btn");
  var topbar = document.getElementById("topbar");
  var gjsContainer = document.getElementById("gjs");
  var saveBtn = document.getElementById("save-btn");
  var statusEl = document.getElementById("status");

  loginBtn.addEventListener("click", function () {
    loginBtn.disabled = true;
    gateStatus.textContent = "Waiting for GitHub login…";
    gh.loginWithGitHub()
      .then(function (t) {
        token = t;
        gateStatus.textContent = "Loading current design…";
        return Promise.all([
          gh.getFile(token, cfg.htmlPath),
          gh.getFile(token, cfg.cssPath),
        ]);
      })
      .then(function (results) {
        var htmlFile = results[0];
        var cssFile = results[1];
        htmlSha = htmlFile.sha;
        cssSha = cssFile.sha;
        startEditor(htmlFile.text, cssFile.text);
      })
      .catch(function (err) {
        console.error(err);
        loginBtn.disabled = false;
        gateStatus.textContent = "Error: " + err.message;
      });
  });

  function startEditor(html, css) {
    gate.style.display = "none";
    topbar.style.display = "flex";
    gjsContainer.style.display = "block";

    gjsEditor = grapesjs.init({
      container: "#gjs",
      height: "100%",
      fromElement: false,
      storageManager: false,
      // Suppresses GrapesJS's own default canvas reset (box-sizing/body margin)
      // from being included in getCss() output — style.css already covers that,
      // and duplicating it here would just be silent bloat in the saved file.
      protectedCss: "",
      plugins: ["grapesjs-preset-webpage"],
      pluginsOpts: {
        "grapesjs-preset-webpage": {},
      },
    });

    gjsEditor.setComponents(html);
    gjsEditor.setStyle(css);

    saveBtn.disabled = false;
    statusEl.textContent = "Loaded — logged in";
  }

  saveBtn.addEventListener("click", function () {
    if (!gjsEditor || !token) return;

    saveBtn.disabled = true;
    statusEl.textContent = "Saving…";

    // getHtml() wraps output in <body>...</body>; strip it since this fragment
    // gets synced inside the real page's own <body> (see scripts/sync-design.js) —
    // a literal nested <body> tag there would be invalid HTML.
    var newHtml = gjsEditor.getHtml().replace(/^\s*<body[^>]*>/i, "").replace(/<\/body>\s*$/i, "").trim();
    var newCss = gjsEditor.getCss();

    gh.putFile(token, cfg.htmlPath, newHtml, htmlSha, "Update homepage design (via /editor/)")
      .then(function (sha) {
        htmlSha = sha;
        return gh.putFile(token, cfg.cssPath, newCss, cssSha, "Update homepage design styles (via /editor/)");
      })
      .then(function (sha) {
        cssSha = sha;
        var time = new Date().toLocaleTimeString();
        statusEl.textContent = "Saved at " + time + " — build will follow shortly";
        saveBtn.disabled = false;
      })
      .catch(function (err) {
        console.error(err);
        statusEl.textContent = "Save failed: " + err.message;
        saveBtn.disabled = false;
      });
  });
})();
