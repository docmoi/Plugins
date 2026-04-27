const BASE_URL = "https://phimtvhay.org";

function getManifest() {
    return JSON.stringify({
        id: "tvhay_simple",
        name: "TVHay đơn giản",
        version: "1.0",
        baseUrl: BASE_URL,
        type: "MOVIE",
        playerType: "webview"
    });
}

function getHomeSections() {
    return JSON.stringify([{ id: "home", name: "Trang chủ", type: "list" }]);
}

function getUrlList(slug, filtersJson) {
    return BASE_URL;
}

function parseListResponse(html) {
    // Bắt tất cả thẻ a có chứa ảnh và tiêu đề
    let items = [];
    let regex = /<a href="\/([^"]+)".*?<img.*?src="([^"]+)".*?alt="([^"]+)"/gis;
    let match;
    while ((match = regex.exec(html)) !== null) {
        items.push({
            id: match[1],
            title: match[3],
            posterUrl: match[2].startsWith("http") ? match[2] : BASE_URL + match[2]
        });
    }
    return JSON.stringify({ items: items, pagination: {} });
}

// Các hàm khác để trống
function getUrlDetail(slug) { return BASE_URL + "/" + slug; }
function parseMovieDetail(html) { return JSON.stringify({ id: "", title: "", servers: [] }); }
function parseDetailResponse(html, url) { return JSON.stringify({ url: "", isEmbed: false }); }
function getPrimaryCategories() { return "[]"; }
function getFilterConfig() { return "{}"; }
function getUrlSearch(k, f) { return BASE_URL; }
function parseSearchResponse(h) { return parseListResponse(h); }
