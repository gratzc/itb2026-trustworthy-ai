(function () {
	var LAB_LEVEL = window.ITB_LAB_LEVEL;
	var openMsg = window.ITB_OPEN_MSG;
	var messagesEl = document.getElementById("messages");
	var form = document.getElementById("composer");
	var input = document.getElementById("message");
	var sendBtn = document.getElementById("send");
	var hintsEl = document.getElementById("lab-hints");
	if (hintsEl && new URLSearchParams(location.search).get("hints") === "1") hintsEl.hidden = false;

	function escapeHtml(s) {
		var div = document.createElement("div");
		div.textContent = s;
		return div.innerHTML;
	}

	function linkify(text) {
		var escaped = escapeHtml(text);
		return escaped.replace(/(https?:\/\/[^\s<]+)/g, function (url) {
			return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + "</a>";
		});
	}

	function appendBubble(role, html) {
		var div = document.createElement("div");
		div.className = "msg " + role;
		var label = role === "bot" ? "Boxton" : "You";
		div.innerHTML = '<div class="label">' + label + '</div><div class="body">' + html + "</div>";
		messagesEl.appendChild(div);
		messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	appendBubble("bot", linkify(openMsg));

	form.addEventListener("submit", function (e) {
		e.preventDefault();
		var text = (input.value || "").trim();
		if (!text) return;

		appendBubble("user", escapeHtml(text));
		input.value = "";
		sendBtn.disabled = true;

		fetch("/lab/api/chat.bxm", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message: text, level: LAB_LEVEL })
		})
			.then(function (r) { return r.json().then(function (data) { return { ok: r.ok, data: data }; }); })
			.then(function (res) {
				if (!res.ok || (res.data && res.data.error)) {
					appendBubble("bot", escapeHtml((res.data && res.data.error) || "Something went wrong. Try again."));
					return;
				}
				appendBubble("bot", linkify((res.data && res.data.reply) || ""));
			})
			.catch(function () {
				appendBubble("bot", escapeHtml("Network error — is the BoxLang MiniServer running?"));
			})
			.then(function () {
				sendBtn.disabled = false;
				input.focus();
			});
	});

	input.focus();
})();
