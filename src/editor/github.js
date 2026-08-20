// GitHub login (via the shared cms-oauth-worker) and Contents API helpers for
// the homepage editor. No server of our own — every write goes straight to
// GitHub as a normal commit, same as Decap CMS already does.
(function () {
  "use strict";

  var cfg = window.SHARAV_EDITOR_CONFIG;
  var API_BASE = "https://api.github.com";

  // --- UTF-8-safe base64 (GitHub's Contents API speaks base64; atob/btoa alone
  // mangle multi-byte characters like the Hebrew in this site's copy). ---
  function utf8ToBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = "";
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  function base64ToUtf8(b64) {
    var binary = atob(b64.replace(/\n/g, ""));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }

  // --- OAuth login, matching the handshake cms-oauth-worker/src/worker.js
  // implements for Decap CMS: the popup announces itself with
  // "authorizing:github", we reply to it (any message, same origin check),
  // and it then sends back "authorization:github:success:<json>". ---
  function loginWithGitHub() {
    return new Promise(function (resolve, reject) {
      var popup = window.open(
        cfg.oauthWorkerBase + "/auth",
        "sharav-github-login",
        "width=600,height=700"
      );
      if (!popup) {
        reject(new Error("Popup blocked — please allow popups for this site and try again."));
        return;
      }

      var workerOrigin = new URL(cfg.oauthWorkerBase).origin;
      var settled = false;

      function cleanup() {
        window.removeEventListener("message", handleMessage);
      }

      function handleMessage(e) {
        if (e.origin !== workerOrigin) return;
        if (e.data === "authorizing:github") {
          // Acknowledge so the popup completes the handshake and sends the token.
          popup.postMessage("authorizing:github", workerOrigin);
          return;
        }
        if (typeof e.data === "string" && e.data.indexOf("authorization:github:success:") === 0) {
          settled = true;
          cleanup();
          try {
            var payload = JSON.parse(e.data.slice("authorization:github:success:".length));
            resolve(payload.token);
          } catch (err) {
            reject(err);
          }
        }
      }

      window.addEventListener("message", handleMessage);

      var poll = setInterval(function () {
        if (popup.closed) {
          clearInterval(poll);
          if (!settled) {
            cleanup();
            reject(new Error("Login window was closed before completing."));
          }
        }
      }, 500);
    });
  }

  // --- Contents API ---
  function apiHeaders(token) {
    return {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
    };
  }

  function getFile(token, path) {
    var url = API_BASE + "/repos/" + cfg.owner + "/" + cfg.repo + "/contents/" + path + "?ref=" + cfg.branch;
    return fetch(url, { headers: apiHeaders(token) }).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path + " (" + res.status + ")");
      return res.json();
    }).then(function (data) {
      return { text: base64ToUtf8(data.content), sha: data.sha };
    });
  }

  function putFile(token, path, text, sha, message) {
    var url = API_BASE + "/repos/" + cfg.owner + "/" + cfg.repo + "/contents/" + path;
    return fetch(url, {
      method: "PUT",
      headers: Object.assign({ "Content-Type": "application/json" }, apiHeaders(token)),
      body: JSON.stringify({
        message: message,
        content: utf8ToBase64(text),
        sha: sha,
        branch: cfg.branch,
      }),
    }).then(function (res) {
      if (!res.ok) {
        return res.json().then(function (err) {
          throw new Error((err && err.message) || "Failed to save " + path + " (" + res.status + ")");
        });
      }
      return res.json();
    }).then(function (data) {
      return data.content.sha;
    });
  }

  window.SharavGitHub = {
    loginWithGitHub: loginWithGitHub,
    getFile: getFile,
    putFile: putFile,
  };
})();
