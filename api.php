<?php
/**
 * Codashop Live Scraper Proxy API
 * Fetches the Codashop Indonesia homepage, extracts the active product catalog,
 * and outputs it as clean JSON with proper CORS headers.
 * Includes a robust static fallback system in case of network failures.
 */

// Enable CORS and define JSON output headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$targetUrl = "https://www.codashop.com/id-id/";

// Robust fallback catalog if cURL fails, times out, or gets blocked by cloud protection
$fallbackCatalog = [
    [
        "slug" => "mobile-legends",
        "title" => "Mobile Legends: Bang Bang",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg",
        "url" => "https://www.codashop.com/id-id/mobile-legends"
    ],
    [
        "slug" => "free-fire",
        "title" => "Free Fire",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/free-fire-tile-codacash-new.jpg",
        "url" => "https://www.codashop.com/id-id/free-fire"
    ],
    [
        "slug" => "pubg-mobile",
        "title" => "PUBG Mobile",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/pubg_mobile_tile.png",
        "url" => "https://www.codashop.com/id-id/pubg-mobile"
    ],
    [
        "slug" => "genshin-impact",
        "title" => "Genshin Impact",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/genshin_impact_tile.png",
        "url" => "https://www.codashop.com/id-id/genshin-impact"
    ],
    [
        "slug" => "honkai-star-rail",
        "title" => "Honkai: Star Rail",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/HSR-Tile-178x178.png",
        "url" => "https://www.codashop.com/id-id/honkai-star-rail"
    ],
    [
        "slug" => "valorant",
        "title" => "Valorant",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/Valorant_tile.png",
        "url" => "https://www.codashop.com/id-id/valorant"
    ],
    [
        "slug" => "call-of-duty-mobile",
        "title" => "Call of Duty: Mobile",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/codm_tile.png",
        "url" => "https://www.codashop.com/id-id/call-of-duty-mobile"
    ],
    [
        "slug" => "clash-of-clans",
        "title" => "Clash of Clans",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/CoC_Tile_178x178.png",
        "url" => "https://www.codashop.com/id-id/clash-of-clans"
    ],
    [
        "slug" => "clash-royale",
        "title" => "Clash Royale",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/Clash_Royale_tile.png",
        "url" => "https://www.codashop.com/id-id/clash-royale"
    ],
    [
        "slug" => "brawl-stars",
        "title" => "Brawl Stars",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/Brawl_Stars_tile.png",
        "url" => "https://www.codashop.com/id-id/brawl-stars"
    ],
    [
        "slug" => "roblox",
        "title" => "Roblox",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/roblox_tile.png",
        "url" => "https://www.codashop.com/id-id/roblox"
    ],
    [
        "slug" => "steam-wallet-code-id",
        "title" => "Steam Wallet Code",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/steam_id_tile.png",
        "url" => "https://www.codashop.com/id-id/steam-wallet-code-id"
    ],
    [
        "slug" => "google-play-gift-code",
        "title" => "Google Play Gift Code",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/google-play-id-gift-code.png",
        "url" => "https://www.codashop.com/id-id/google-play-gift-code"
    ],
    [
        "slug" => "point-blank",
        "title" => "Point Blank",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/pb_tile.png",
        "url" => "https://www.codashop.com/id-id/point-blank"
    ],
    [
        "slug" => "ea-sports-fc-mobile",
        "title" => "EA SPORTS FC Mobile",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/FC-Mobile-V3-178x178-tile.jpg",
        "url" => "https://www.codashop.com/id-id/ea-sports-fc-mobile"
    ],
    [
        "slug" => "minecraft",
        "title" => "Minecraft",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/Minecraft_178x178.png",
        "url" => "https://www.codashop.com/id-id/minecraft"
    ],
    [
        "slug" => "metal-slug-awakening",
        "title" => "Metal Slug: Awakening",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/Metal_Slug_178x178.png",
        "url" => "https://www.codashop.com/id-id/metal-slug-awakening"
    ],
    [
        "slug" => "eggy-party",
        "title" => "Eggy Party",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/Eggy_Party_tile_178x178.png",
        "url" => "https://www.codashop.com/id-id/eggy-party"
    ],
    [
        "slug" => "arena-of-valor",
        "title" => "Arena of Valor",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/AOV-tile-178x178.png",
        "url" => "https://www.codashop.com/id-id/arena-of-valor"
    ],
    [
        "slug" => "league-of-legends-wild-rift",
        "title" => "Wild Rift",
        "image" => "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/WildRift-178x178_promo.png",
        "url" => "https://www.codashop.com/id-id/league-of-legends-wild-rift"
    ]
];

// Perform cURL request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 8); // 8 seconds timeout
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// If request fails or does not return HTTP 200, return fallback
if ($html === false || $httpCode !== 200) {
    echo json_encode([
        "status" => "fallback",
        "data" => $fallbackCatalog,
        "details" => "Live fetch failed, serving robust database fallback."
    ]);
    exit;
}

// Parse DOM to extract product listings
libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadHTML($html);
$xpath = new DOMXPath($dom);

$anchors = $xpath->query('//a');
$products = [];

foreach ($anchors as $anchor) {
    $href = $anchor->getAttribute('href');
    
    // Check if link is a valid game/product link
    if (preg_match('/\/id-id\/([a-zA-Z0-9_-]+)$/', $href, $matches)) {
        $slug = $matches[1];
        
        // Skip administrative or navigation links
        if (in_array($slug, ['about-us', 'login', 'register', 'home', 'privacy-policy', 'terms-of-service', 'news', 'faq', 'support'])) {
            continue;
        }
        
        // Find logo image inside anchor
        $imgs = $xpath->query('.//img', $anchor);
        $imgUrl = '';
        if ($imgs->length > 0) {
            $imgUrl = $imgs->item(0)->getAttribute('src');
            if (empty($imgUrl)) {
                // Check if lazy load attribute exists
                $imgUrl = $imgs->item(0)->getAttribute('data-src');
            }
        }
        
        // If image URL is relative, make it absolute
        if (!empty($imgUrl) && strpos($imgUrl, '//') === 0) {
            $imgUrl = 'https:' . $imgUrl;
        } elseif (!empty($imgUrl) && strpos($imgUrl, '/') === 0) {
            $imgUrl = 'https://www.codashop.com' . $imgUrl;
        }
        
        // Skip products that don't have images
        if (empty($imgUrl)) {
            continue;
        }
        
        // Extract title
        $title = trim($anchor->textContent);
        
        // If title is empty or too short, let's capitalize the slug as fallback
        if (empty($title)) {
            $title = ucwords(str_replace('-', ' ', $slug));
        }
        
        // Clean up redundant texts commonly attached to scraped textContent
        $title = str_replace(["Top-up", "Top Up", "Indonesia", "ID-ID", "\n", "\r", "\t"], "", $title);
        $title = trim(preg_replace('/\s+/', ' ', $title));
        
        // Determine product absolute URL
        $productUrl = $href;
        if (strpos($productUrl, 'http') !== 0) {
            if (strpos($productUrl, '/') === 0) {
                $productUrl = 'https://www.codashop.com' . $productUrl;
            } else {
                $productUrl = 'https://www.codashop.com/id-id/' . $productUrl;
            }
        }
        
        $products[$slug] = [
            'slug' => $slug,
            'title' => $title,
            'image' => $imgUrl,
            'url' => $productUrl
        ];
    }
}

// If parsed list is too short (possible scraper failure due to DOM changes), return fallback
if (count($products) < 5) {
    echo json_encode([
        "status" => "fallback",
        "data" => $fallbackCatalog,
        "details" => "Live parse returned insufficient items, serving robust fallback."
    ]);
    exit;
}

// Return live parsed data sorted by slug
ksort($products);
echo json_encode([
    "status" => "live",
    "data" => array_values($products)
]);
?>
