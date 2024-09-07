document.addEventListener("DOMContentLoaded", function () {

	// ヘッダー、フッターの内容を設定
	makeHeaderAndFooter();

	// スポンサーを表示
	makeSponsors();

	// URLクエリからpageを取得し、本文の内容を設定。
	const page = (new URLSearchParams(window.location.search)).get("page");
	let markdownLocation;
	if (!page || page == "index") {
		markdownLocation = `${RESOURCE_TOP}/index.md`;
	} else {
		markdownLocation = `${RESOURCE_TOP}/articles/${page}.md`;
	}
	makeArticle(markdownLocation);

});

window.addEventListener("load", function () {

	// 外部リンクが新規タブで開くように設定
	makeExternalLinksOpenInNewTab();

	// ふりがな指定
	const furiganaSwitch = this.document.getElementById("furigana-switch");
	furiganaSwitch.addEventListener("change", function(e) {
		toggleRuby(e.target.checked);
	});
	toggleRuby(furiganaSwitch.checked);
});


/**
 * GitHubからMarkdownファイルを取得し、記事本文の内容を設定する。
 * @param {string} markdownLocation 取得するMarkdownファイルのURL
 */
const makeArticle = function (markdownLocation) {
	const articleElement = document.getElementById("article");
	const mokujiElement = document.getElementById("mokuji");
	const request = new XMLHttpRequest();
	request.open("GET", markdownLocation);
	request.send();
	request.onload = function () {
		let html = mdToHTML(request.responseText);
		articleElement.innerHTML = html.article;
		mokujiElement.innerHTML = html.mokuji;
	};
};

/**
 * GitHubからsponsors.jsonを取得し、sponsorsの内容を表示する。
 */
const makeSponsors = function() {
	const sponsorsElement = document.getElementById("sponsors");
	const request = new XMLHttpRequest();
	request.open("GET", `${RESOURCE_TOP}/sponsors.json`);
	request.send();
	request.onload = function() {
		let sponsorsHTML = `<h2 class="col-12">${putRuby("ご[協賛|きょうさん]いただいた[企業様|きぎょうさま]")}</h2>`;
		const sponsorsJSON = JSON.parse(request.responseText).sponsors;
		for (let item of sponsorsJSON) {
			sponsorsHTML += `<div class="col-12 col-sm-6 col-md-4 p-4"><a href="${item.url}" class="sponsor">`;
			if (item.image) {
				sponsorsHTML += `<img src="${toFullURL(item.image)}" alt="${item.name}のロゴ">`;
			} else {
				sponsorsHTML += `<p>${item.name}</p>`;
			}
			sponsorsHTML += "</a></div>";
		}
		sponsorsElement.innerHTML = sponsorsHTML;
	}
}

/**
 * GitHubからheader-and-footer.jsonを取得し、headerとfooterの内容を表示する。
 */
const makeHeaderAndFooter = function () {
	const headerElement = document.getElementById("header-content");
	const footerElement = document.getElementById("footer-content");
	const request = new XMLHttpRequest();
	request.open("GET", `${RESOURCE_TOP}/header-and-footer.json`);
	request.send();
	request.onload = function () {

		// Header
		let headerHTML = "";
		const headerJSON = JSON.parse(request.responseText).header;
		for (let item of headerJSON) {
			if (item.dropdown) {
				headerHTML += `<li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="" role="button" data-bs-toggle="dropdown" aria-expanded="false">${putRuby(item.text)}</a><ul class="dropdown-menu">`;
				for (let i = 0; i < item.dropdown.length; i++) {
					for (let exhibit of item.dropdown[i]) {
						headerHTML += `<li><a class="dropdown-item" href="${toFullURL(exhibit.href)}">${putRuby(exhibit.text)}</a></li>`;
					}
					if (i < item.dropdown.length - 1) {
						headerHTML += `<li><hr class="dropdown-divider"></li>`;
					}
				}
				headerHTML += "</ul></li>";
			} else {
				headerHTML += `<li class="nav-item"><a class="nav-link" aria-current="page" href="${toFullURL(item.href)}">${putRuby(item.text)}</a></li>`;
			}
		}
		headerElement.innerHTML = headerHTML;

		// Footer
		let footerHTML = "";
		const footerJSON = JSON.parse(request.responseText).footer;
		for (let section of footerJSON) {
			footerHTML += `<div class="col-8 col-sm-6 mb-3"><ul class="nav flex-column">`;
			for (let item of section) {
				footerHTML += `<li class="nav-item mb-2"><a href="${toFullURL(item.href)}" class="nav-link p-0 text-body-secondary">${putRuby(item.text)}</a></li>`;
			}
			footerHTML += `</ul></div>`;
		}
		footerElement.innerHTML = footerHTML;
	};
};



/**
 * CSS変数を制御することで、ルビの表示・非表示を切り替える。
 * @param {boolean} on ルビを表示するときはtrue、そうでなければfalse
 */
const toggleRuby = function (on) {
	const root = document.querySelector(":root");
	if (on) {
		// ルビを表示する
		root.style.setProperty('--ruby-display', 'unset');
		root.style.setProperty('--line-height-scale', "1.15");
	} else {
		// ルビを隠す
		root.style.setProperty('--ruby-display', 'none');
		root.style.setProperty('--line-height-scale', "1");
	}
};

/**
 * 「https://ut-cast.net/mayfes2024」以外で始まるリンクに target="_blank" を付与し、新規タブで開くようにする。
 * （最後に呼び出す）
 */
const makeExternalLinksOpenInNewTab = function () {
	for (let a of document.querySelectorAll("a")) {
		if (a.href.startsWith("http") && !a.href.startsWith("https://ut-cast.net/mayfes2024")) {
			a.target = "_blank";
		}
	}
};