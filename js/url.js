/**
 * 学園祭ページのURL、ただし最後の / は含めない。
 * 例："https://ut-cast.net/mayfes2024"
 */
// const SITE_TOP = "https://ut-cast.net/mayfes2024";

/**
 * GitHubのリソースの場所、ただし最後の / は含めない。
 * 例："https://raw.githubusercontent.com/utcast/mf97-website/main/contents"
 */
// const RESOURCE_TOP = "https://raw.githubusercontent.com/utcast/mf97-website/main/contents";
const RESOURCE_TOP = (() => {
	if (location.hostname == "utcast.github.io") {
		return "https://raw.githubusercontent.com/utcast/kf75-website/draft/contents";
	} else if (location.hostname == "ut-cast.net") {
		return "https://raw.githubusercontent.com/utcast/kf75-website/main/contents";
	} else {
		return "../contents";
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
	} else if (url.startsWith("en/")) {
		// "en/"で始まる場合、そのまま返す
		return url;
	} else {
		return `?page=${url}`;
	}
}
