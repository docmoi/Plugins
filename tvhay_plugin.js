// ==================== PLUGIN CHO PHIMTVHAY.ORG ====================
const BASE_URL = "https://phimtvhay.org";

function getManifest() {
    return JSON.stringify({
        id: "phimtvhay",
        name: "TVHay - Phim TV Hay",
        version: "1.0.0",
        baseUrl: https://phimtvhay.org,
        iconUrl: "https://phimtvhay.org/favicon.ico",
        isEnabled: true,
        isAdult: false,
        type: "MOVIE",
        layoutType: "VERTICAL",
        playerType: "auto"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { id: "new-movies", name: "Phim Mới Cập Nhật", type: "list" }
    ]);
}

function getUrlList(slug, filtersJson) {
    // Trang chủ: lấy phim mới
    if (slug === "new-movies") {
        return BASE_URL + "/";
    }
    // Mặc định: trang chủ
    return BASE_URL + "/";
}

function parseListResponse(html) {
    let items = [];
    
    // Pattern tìm mỗi item phim trong HTML (dựa trên cấu trúc thường thấy)
    let itemRegex = /<a\s+href="\/([^"]+)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>/gi;
    let match;
    
    while ((match = itemRegex.exec(html)) !== null) {
        let slug = match[1];
        let posterUrl = match[2];
        let title = match[3].trim();
        
        if (slug && title) {
            items.push({
                id: slug,
                title: title,
                posterUrl: posterUrl.startsWith("http") ? posterUrl : BASE_URL + posterUrl,
                year: new Date().getFullYear(),
                quality: "HD"
            });
        }
    }
    
    return JSON.stringify({
        items: items,
        pagination: { currentPage: 1, totalPages: 1 }
    });
}

function getUrlDetail(slug) {
    return BASE_URL + "/" + slug;
}

function parseMovieDetail(html) {
    // Lấy tiêu đề phim
    let titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    let title = titleMatch ? titleMatch[1].trim() : "Không có tiêu đề";
    
    // Lấy poster (ưu tiên ảnh trong thẻ meta hoặc img)
    let posterMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
    let posterUrl = posterMatch ? posterMatch[1] : "";
    
    // Lấy mô tả
    let descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    let description = descMatch ? descMatch[1] : "";
    
    // Lấy danh sách tập phim (thường nằm trong các thẻ a có class chứa "episode" hoặc "server")
    let episodes = [];
    let epRegex = /<a\s+href="([^"]+)"[^>]*class="[^"]*ep(?:isode)?[^"]*"[^>]*>([^<]+)<\/a>/gi;
    let epMatch;
    while ((epMatch = epRegex.exec(html)) !== null) {
        let epUrl = epMatch[1];
        let epName = epMatch[2].trim();
        if (epUrl && epName && !epUrl.includes("#")) {
            episodes.push({ id: epUrl, name: epName });
        }
    }
    
    // Nếu không tìm thấy tập theo pattern trên, thử pattern tổng quát hơn
    if (episodes.length === 0) {
        let genericRegex = /<a\s+href="([^"]+)"[^>]*>([^<]*(?:Tập|Ep|Episode)[^<]*)<\/a>/gi;
        while ((epMatch = genericRegex.exec(html)) !== null) {
            let epUrl = epMatch[1];
            let epName = epMatch[2].trim();
            if (epUrl && epName && !epUrl.includes("#") && !epUrl.includes("javascript")) {
                episodes.push({ id: epUrl, name: epName });
            }
        }
    }
    
    let servers = [];
    if (episodes.length > 0) {
        servers.push({ name: "Server Chính", episodes: episodes });
    } else {
        // Fallback: thử lấy toàn bộ link có thể là video
        let fallbackRegex = /<iframe[^>]+src="([^"]+)"[^>]*>/gi;
        let iframeMatch = fallbackRegex.exec(html);
        if (iframeMatch && iframeMatch[1]) {
            servers.push({ 
                name: "Nhúng", 
                episodes: [{ id: iframeMatch[1], name: "Xem Ngay" }] 
            });
        }
    }
    
    return JSON.stringify({
        id: "",
        title: title,
        posterUrl: posterUrl,
        description: description,
        servers: servers,
        year: new Date().getFullYear(),
        quality: "HD",
        duration: ""
    });
}

function parseDetailResponse(html, url) {
    // Tìm link video trực tiếp (m3u8/mp4) hoặc iframe
    let m3u8Match = html.match(/(https?:[^"'\s]+\.m3u8[^"'\s]*)/i);
    if (m3u8Match) {
        return JSON.stringify({
            url: m3u8Match[1],
            isEmbed: false,
            mimeType: "application/x-mpegURL"
        });
    }
    
    let mp4Match = html.match(/(https?:[^"'\s]+\.mp4[^"'\s]*)/i);
    if (mp4Match) {
        return JSON.stringify({
            url: mp4Match[1],
            isEmbed: false,
            mimeType: "video/mp4"
        });
    }
    
    // Tìm iframe embed
    let iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
    if (iframeMatch) {
        return JSON.stringify({
            url: iframeMatch[1],
            isEmbed: true,
            headers: { "Referer": BASE_URL }
        });
    }
    
    return JSON.stringify({ url: "", isEmbed: false });
}

// Các hàm bắt buộc khác (trả về rỗng hoặc mặc định)
function getPrimaryCategories() { return JSON.stringify([]); }
function getFilterConfig() { return JSON.stringify({}); }
function getUrlSearch(keyword, filtersJson) { return BASE_URL + "/tim-kiem?q=" + encodeURIComponent(keyword); }
function parseSearchResponse(html) { return parseListResponse(html); }
function getUrlCategories() { return ""; }
function getUrlCountries() { return ""; }
function getUrlYears() { return ""; }
function parseCategoriesResponse(html) { return JSON.stringify([]); }
function parseCountriesResponse(html) { return JSON.stringify([]); }
function parseYearsResponse(html) { return JSON.stringify([]); }
