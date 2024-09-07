/**
 * MDで入力された文字列をHTMLのコードとして返す。
 */

/**
 * MDテキストをHTMLに変換
 * @param {string} md MDフォーマットの文字列
 * @returns {{article: string, mokuji: string}} それぞれのinnerHTMLを返す。
 */
const mdToHTML = function (md) {

	/**
	 * 最終的に生成されるHTMLテキスト（articleのinnerHTMLに相当）
	 */
	let articleHTML = "";

	/**
	 * 目次のHTMLテキスト（H1~H3までを記録）
	 */
	let mokujiHTML = "";

	/**
	 * 直前の行の内容（カルーセル、箇条書き、画像、など。）
	 */
	let objectAhead = "";

	/**
	 * 直前の見出しの階層。
	 * H1は記事に1つとし、目次には含めない。
	 */
	let previousHeadingLevel = 1;

	/**
	 * 直前にある<p>, 画像（のキャプション）, <carousel>, <ul>, <ol> を閉じる処理
	 * @param {string} objAhead 
	 */
	const closePrevious = function () {
		if (objectAhead == "") {
			return;
		}

		// card-containerを閉じる
		else if (objectAhead == "card-container") {
			articleHTML += "</div>";
		}

		// <p>を閉じる
		else if (objectAhead == "p") {
			articleHTML += "</p>";
		}

		// <img>のキャプションを閉じる
		else if (objectAhead == "img") {
			articleHTML += "</p></div>";
		}

		// carouselを閉じる
		else if (objectAhead == "carousel") {
			articleHTML += '</div><button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">前の画像</span></button><button class="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">次の画像</span></button></div>';
		}

		// <ul>を閉じる
		else if (objectAhead == "ul") {
			articleHTML += "</ul>";
		}

		// <ol>を閉じる
		else if (objectAhead == "ol") {
			articleHTML += "</ol>";
		}

		objectAhead = "";
	}

	/**
	 * 目次が適宜入れ子になるようにする。
	 */
	const makeMokuji = function (toHeadingLevel) {

		if (previousHeadingLevel < toHeadingLevel) {
			for (let i = 0; i < toHeadingLevel - previousHeadingLevel; i++) {
				mokujiHTML += '<nav class="nav nav-pills flex-column ps-3">';
			}
		} else if (previousHeadingLevel > toHeadingLevel) {
			for (let i = 0; i < previousHeadingLevel - toHeadingLevel; i++) {
				mokujiHTML += '</nav>';
			}
		}
		previousHeadingLevel = toHeadingLevel;

	}

	const articleLines = md.split("\n");

	for (let line of articleLines) {

		// 「```」〜「```」まではrawHTMLと解釈する。
		if (line == "```") {
			if (objectAhead == "rawHTML") {
				objectAhead = "";
			} else {
				closePrevious();
				objectAhead = "rawHTML";
			}
			continue;
		}

		// rawHTMLの中身は何も解釈せず、そのまま追加する。
		if (objectAhead == "rawHTML") {
			articleHTML += line;
			continue;
		}

		// 「---」〜「---」はcardとして解釈する。
		if (line == "---") {
			
			if (objectAhead == "card") {
				// Card を閉じる
				articleHTML += "</div></a>";
				objectAhead = "card-container";
			}

			else {
				if (objectAhead != "card-container") {

					// 前のオブジェクトを閉じる
					closePrevious();
	
					// Card-containerを開く
					articleHTML += `<div class="d-flex flex-wrap my-2">`;
					
				}

				// Cardを開く
				articleHTML += `<a class="card col-12 col-sm-6 col-xl-4 p-2" href="`;
				objectAhead = "card";
			} 

			continue;

		}

		// cardの中身を解釈する
		if (objectAhead == "card") {

			// cardの１行目は、 [title](該当ページへのリンク) とする
			if (line.startsWith("[title](")) {
				let url = toFullURL(line.substring(8, line.lastIndexOf(")")));
				articleHTML += `${url}">`;
			}

			// 画像を追加する
			else if (/^!\[.+?\]\(.+?\)$/.test(line)) {
				let imageAlt = line.substring(line.indexOf("![") + 2, line.lastIndexOf("]("));
				let imageSrc = line.substring(line.lastIndexOf("](") + 2, line.lastIndexOf(")"));
				articleHTML += `<img src="${toFullURL(imageSrc)}" class="card-img-top" alt="${imageAlt}">`;
			}

			// タイトルを追加する
			else if (line.startsWith("## ")) {
				articleHTML += `<div class="card-body"><h5 class="card-title">${putRuby(line.substring(3))}</h5>`;
			}

			// 本文を追加する
			else {
				articleHTML += `<p class="card-text">${putRuby(line)}</p>`;
			}

			continue;
		}

		// 空白行 → <p>, <img>のキャプション, <carousel>, <ul>, <ol> を閉じる処理
		if (line == "") {
			closePrevious();
			continue;
		}

		// 本文は、タイトルから解読する。タイトルの直後にある一連の画像はカルーセルにする。H1は記事に一つとし、目次には含めない。
		if (line.startsWith("# ")) {

			// 記事について
			closePrevious();
			let title = removeUnintendedHTMLTags(line.substring(2));
			articleHTML += `<h1>${insertHyperlink(putRuby(title))}</h1>`;
			objectAhead = "h1";

			continue;
		}

		// H2を解釈する。
		if (line.startsWith("## ")) {

			// 記事について
			closePrevious();
			let title = removeUnintendedHTMLTags(line.substring(3));
			let anchor = removeRuby(title);
			articleHTML += `<h2 id="${anchor}">${insertHyperlink(putRuby(title))}</h2>`;
			objectAhead = "h2";

			// 目次について
			makeMokuji(2);
			mokujiHTML += `<a class="nav-link ms-3 my-1" href="#${anchor}">${putRuby(title)}</a>`;

			continue;
		}

		// H3を解釈する。
		if (line.startsWith("### ")) {

			// 記事について
			closePrevious();
			let title = removeUnintendedHTMLTags(line.substring(4));
			let anchor = removeRuby(title);
			articleHTML += `<h3 id="${anchor}">${insertHyperlink(putRuby(title))}</h3>`;
			objectAhead = "h3";

			// 目次について
			makeMokuji(3);
			mokujiHTML += `<a class="nav-link ms-3 my-1" href="#${anchor}">${putRuby(title)}</a>`;

			continue;
		}

		// 画像を解釈する。（画像は単体で１行におく。）
		if (/^!\[.+?\]\(.+?\)$/.test(line)) {
			let imageAlt = line.substring(line.indexOf("![") + 2, line.lastIndexOf("]("));
			let imageSrc = line.substring(line.lastIndexOf("](") + 2, line.lastIndexOf(")"));

			// h1の直後にある時は、carouselを追加
			if (objectAhead == "h1") {
				// カルーセルを開く
				articleHTML += '<div id="carouselExampleAutoplaying" class="carousel slide user-select-none" data-bs-ride="carousel"><div class="carousel-inner">';
				objectAhead = "carousel";
			}
			// carouselに画像を追加
			if (objectAhead == "carousel") {
				// カルーセルに画像を追加する
				articleHTML += `<div class="carousel-item active"><img src="${toFullURL(imageSrc)}" class="d-block w-100" alt="${imageAlt}"></div>`;
				continue;
			}

			// objectAheadがh1, carousel以外のときは、closePrevious()をしてから通常の画像を追加
			closePrevious();
			articleHTML += `<div class="picture-frame"><div class="picture" style="background: center / contain no-repeat url('${toFullURL(imageSrc)}') , #CCC;"></div><p>`;
			objectAhead = "img";
			continue;
		}

		// 箇条書きを追加する。
		if (line.startsWith("* ") || line.startsWith("- ") || line.startsWith("+ ")) {
			if (!objectAhead == "ul") {
				closePrevious();
				articleHTML += `<ul>`;
				objectAhead = "ul";
			}
			articleHTML += `<li>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line.substring(2))))}</li>`;
			continue;
		}

		// 番号付きリストを追加する。
		if (/^[0-9]+\. .*/.test(line)) {
			if (!objectAhead == "ol") {
				closePrevious();
				articleHTML += `<ol>`;
				objectAhead = "ol";
			}
			articleHTML += `<ol>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line.substring(line.indexOf(" " + 1)))))}</ol>`;
			continue;
		}

		// ただの段落を追加する。直前のオブジェクトが画像の時は、そのラベルとして入れる。
		if (objectAhead == "img" || objectAhead == "p") {
			articleHTML += `${insertHyperlink(putRuby(removeUnintendedHTMLTags(line)))}`;
			continue;
		} else {
			closePrevious();
			articleHTML += `<p>${insertHyperlink(putRuby(removeUnintendedHTMLTags(line)))}`;
			objectAhead = "p";
		}

	}

	// 文末の処理
	closePrevious();

	// 目次の終わりの処理
	makeMokuji(1);

	return {
		article: articleHTML,
		mokuji: mokujiHTML
	};
};

/**
 * 入力された文字列の <br> タグだけを残し、他の < を &lt; に、 > を &gt; に置換することで、生成されるHTMLに意図しないタグが挿入されることを防ぐ。
 * @param {*} str 
 * @returns {string}
 */
const removeUnintendedHTMLTags = function (str) {
	return str.split("<br>").map(line => line.replaceAll("<", "&lt;").replaceAll(">", "&gt;")).join("<br>");
};

/**
 * 振り仮名を表記したMDをHTML記法に変換する
 * @param {string} inputText [漢字|ふりがな]が含まれるテキスト
 * @returns {string} <span data-ruby="ふりがな">漢字</span>が含まれるテキスト
 */
const putRuby = function (inputText) {

	// ["["を除く任意の文字列|任意の文字列]の最短一致
	const rubySearch = /\[[^\[]+?\|.+?\]/g;

	// 正規表現でSplitした配列（前後の空文字も含む）
	let baseTextArray = inputText.split(rubySearch, -1);
	// 正規表現にMatchした文字列
	let rubyTextArray = inputText.match(rubySearch);

	if (!rubyTextArray) {
		return inputText;
	}

	// 返す文字列
	let output = "";
	for (let i = 0; i < rubyTextArray.length; i++) {
		let rubyText = rubyTextArray[i];
		let splitIndex = rubyText.lastIndexOf("|");
		let ruby_kanji = rubyText.substring(1, splitIndex);
		let ruby_kana = rubyText.substring(splitIndex + 1, rubyText.length - 1);
		output += `${baseTextArray[i]}<span data-ruby="${ruby_kana}">${ruby_kanji}</span>`;
	}
	output += baseTextArray[baseTextArray.length - 1];

	return output;

};

/**
 * [リンクタイトル](URL)を含むMDを、 <a> タグに変換する。
 * リンクタイトルに振り仮名を含む可能性があるため、 putRuby よりも後に呼び出す。
 * その際、URL部分に linkTemplate が含まれていたら置換する。
 * @param {string} md [リンクタイトル](URL)を含む文字列
 * @returns {string} <a href="URL">リンクタイトル</a>を含む文字列
 */
const insertHyperlink = function (inputText) {

	// [任意の文字列](任意の文字列)の最短一致
	const linkSearch = /\[.+?\]\(.+?\)/g;

	// 正規表現でSplitした配列（前後の空文字も含む）
	let baseTextArray = inputText.split(linkSearch, -1);
	// 正規表現にMatchした文字列
	let linkTextArray = inputText.match(linkSearch);

	if (!linkTextArray) {
		return inputText;
	}

	// 返す文字列
	let output = "";
	for (let i = 0; i < linkTextArray.length; i++) {
		let linkText = linkTextArray[i];
		let splitIndex = linkText.lastIndexOf("](");
		let linkTitle = linkText.substring(1, splitIndex);
		let linkURL = linkText.substring(splitIndex + 2, linkText.length - 1);
		output += `${baseTextArray[i]}<a href="${toFullURL(linkURL)}">${linkTitle}</a>`;
	}
	output += baseTextArray[baseTextArray.length - 1];

	return output;

}

/**
 * 振り仮名を取り除く
 * @param {string} inputText [漢字|ふりがな]が含まれるテキスト
 * @returns {string} 漢字が含まれるテキスト
 */
const removeRuby = function (inputText) {

	// ["["を除く任意の文字列|任意の文字列]の最短一致
	const rubySearch = /\[[^\[]+?\|.+?\]/g;

	// 正規表現でSplitした配列（前後の空文字も含む）
	let baseTextArray = inputText.split(rubySearch, -1);
	// 正規表現にMatchした文字列
	let rubyTextArray = inputText.match(rubySearch);

	if (!rubyTextArray) {
		return inputText;
	}

	// 返す文字列
	let output = "";
	for (let i = 0; i < rubyTextArray.length; i++) {
		let rubyText = rubyTextArray[i];
		let splitIndex = rubyText.lastIndexOf("|");
		let ruby_kanji = rubyText.substring(1, splitIndex);
		output += `${baseTextArray[i]}${ruby_kanji}`;
	}
	output += baseTextArray[baseTextArray.length - 1];

	return output;

}