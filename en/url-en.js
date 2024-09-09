/**
 * 学園祭ページのURL、ただし最後の / は含めない。
 * 例："https://ut-cast.net/mayfes2024"
 */
// const SITE_TOP = "https://ut-cast.net/mayfes2024/en";

/**
 * GitHubのリソースの場所、ただし最後の / は含めない。
 * 例："https://raw.githubusercontent.com/utcast/mf97-website/main/contents-en"
 */
// const RESOURCE_TOP = "https://raw.githubusercontent.com/utcast/mf97-website/main/contents-en";
const RESOURCE_TOP = (() => {
	if (location.hostname == "utcast.github.io") {
		return "https://raw.githubusercontent.com/utcast/kf75-website/draft/contents-en";
	} else if (location.hostname == "ut-cast.net") {
		return "https://raw.githubusercontent.com/utcast/kf75-website/main/contents-en";
	} else {
		return "../contents-en";
	}
})();

/**
 * ルート相対パスを正しく作動するURLに変換する。
 * urlが / で始まる場合　→　GitHubのcontentsをルートとして扱う
 * urlが http:// または https:// で始まる場合　→ そのまま返す
 * それ以外の場合　→ "?page=(url)"の形に変換する。
 * @param {string} url 絶対パスもしくはルート相対パスのURL
 * @returns {string} 正しく作動するURL
 */
const toFullURL = function (url) {
	if (url.startsWith("/")) {
		return `${RESOURCE_TOP}${url}`;
	} else if (url.startsWith("http://") || url.startsWith("https://")) {
		return url;
	}
	 else if(url.startsWith("../")) {
		return url;
	 }else {
		return `?page=${url}`;
	}
}