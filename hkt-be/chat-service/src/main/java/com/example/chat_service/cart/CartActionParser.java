package com.example.chat_service.cart;

import com.example.chat_service.service.FuzzyProductMatcher;
import com.example.chat_service.service.VectorStoreService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Parse lệnh giỏ hàng từ prompt người dùng.
 *
 * Flow:
 *   1. Regex → size, quantity, productKeyword
 *   2. Vector search Qdrant → top candidates
 *   3. FuzzyProductMatcher → resolvedProductName
 */
@Component
public class CartActionParser {

    private final VectorStoreService    vectorStoreService;
    private final FuzzyProductMatcher   fuzzyMatcher;       // inject từ service package

    public CartActionParser(VectorStoreService vectorStoreService,
                            FuzzyProductMatcher fuzzyMatcher) {
        this.vectorStoreService = vectorStoreService;
        this.fuzzyMatcher       = fuzzyMatcher;
    }

    // ── Result ────────────────────────────────────────────────────────────────

    public static class ParsedCartAction {
        public String productKeyword;       // keyword thô
        public String resolvedProductName;  // tên sản phẩm đã resolve (null nếu không tìm được)
        public double resolvedScore;
        public String size     = "M";
        public int    quantity = 1;

        public boolean isResolved() {
            return resolvedProductName != null
                    && resolvedScore >= FuzzyProductMatcher.THRESHOLD;
        }
    }

    // ── Parse với vector search ───────────────────────────────────────────────

    /**
     * @param prompt         câu gốc tiếng Việt
     * @param englishQuery   bản dịch tiếng Anh để embed Qdrant (null → skip vector search)
     * @param allProductNames toàn bộ tên sản phẩm (fallback khi không có englishQuery)
     */
    public ParsedCartAction parse(String prompt, String englishQuery,
                                  List<String> allProductNames) {
        ParsedCartAction result = new ParsedCartAction();
        String lower = prompt.toLowerCase();

        // 1. Size
        Matcher sizeMatcher = Pattern.compile("size\\s+(xs|s|m|l|xl|xxl)").matcher(lower);
        if (sizeMatcher.find()) result.size = sizeMatcher.group(1).toUpperCase();

        // 2. Quantity
        Matcher qtyMatcher = Pattern.compile(
                        "(?:số lượng|sl|x|quantity)?\\s*(\\d+)\\s*(?:cái|chiếc|sản phẩm|sp)?")
                .matcher(lower);
        int lastQty = 1;
        while (qtyMatcher.find()) {
            try { lastQty = Integer.parseInt(qtyMatcher.group(1)); }
            catch (NumberFormatException ignored) {}
        }
        result.quantity = lastQty;

        // 3. Product keyword
        result.productKeyword = lower
                .replaceAll("thêm vào giỏ|bỏ vào giỏ|cho vào giỏ|đặt|mua|order|add to cart", "")
                .replaceAll("xóa|xoá|bỏ ra|remove|bỏ khỏi giỏ|xóa khỏi giỏ", "")
                .replaceAll("size\\s+(xs|s|m|l|xl|xxl)", "")
                .replaceAll("(?:số lượng|sl|x)?\\s*\\d+\\s*(?:cái|chiếc|sản phẩm|sp)?", "")
                .replaceAll("cho tôi|giúp tôi|giúp em|nhé|nha|ạ|ơi", "")
                .trim();

        // 4. Candidates từ vector search hoặc fallback
        List<String> candidates = (englishQuery != null && !englishQuery.isBlank())
                ? vectorStoreService.searchRelevant(englishQuery, 10)
                .stream().map(m -> (String) m.get("name")).collect(Collectors.toList())
                : allProductNames;

        // 5. Fuzzy match
        if (!candidates.isEmpty()) {
            FuzzyProductMatcher.MatchResult best =
                    fuzzyMatcher.findBest(result.productKeyword, candidates);
            System.out.printf("[CartFuzzy] '%s' → '%s' (%.3f)%n",
                    result.productKeyword, best.name, best.score);
            result.resolvedProductName = best.name;
            result.resolvedScore       = best.score;
        }

        return result;
    }

    /** Overload không cần englishQuery — fuzzy trên toàn bộ allProductNames. */
    public ParsedCartAction parse(String prompt, List<String> allProductNames) {
        return parse(prompt, null, allProductNames);
    }

    /** Overload tương thích ngược với code cũ (ChatController đang gọi parse(prompt)). */
    public ParsedCartAction parse(String prompt) {
        return parse(prompt, null, List.of());
    }
}