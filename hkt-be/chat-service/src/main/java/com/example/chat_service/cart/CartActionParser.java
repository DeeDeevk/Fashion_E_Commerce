package com.example.chat_service.cart;

import com.example.chat_service.service.FuzzyProductMatcher;
import com.example.chat_service.service.VectorStoreService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Parse lệnh giỏ hàng theo flow 4 layer:
 *
 *  Layer 1 — Rule-based  : CartIntentDetector (bên ngoài, đã xử lý)
 *  Layer 2 — Entity Ext  : CartEntityExtractor (Groq JSON) → productName sạch, size, qty
 *  Layer 3 — Context     : resolvedPrompt từ ChatController (co-reference đã được resolve)
 *  Layer 4 — Vector+Fuzzy: Qdrant search → FuzzyMatcher → best match
 *  Fallback — LLM        : nếu score < THRESHOLD → trả fromContext=true để caller hỏi lại
 */
@Component
public class CartActionParser {

    private final VectorStoreService  vectorStoreService;
    private final FuzzyProductMatcher fuzzyMatcher;
    private final CartEntityExtractor entityExtractor;

    public CartActionParser(VectorStoreService vectorStoreService,
                            FuzzyProductMatcher fuzzyMatcher,
                            CartEntityExtractor entityExtractor) {
        this.vectorStoreService = vectorStoreService;
        this.fuzzyMatcher       = fuzzyMatcher;
        this.entityExtractor    = entityExtractor;
    }

    // ── Result ────────────────────────────────────────────────────────────────

    public static class ParsedCartAction {
        public String  productKeyword;       // keyword đã extract (sạch)
        public String  resolvedProductName;  // tên sản phẩm đã match với DB
        public double  resolvedScore;
        public String  size       = "M";
        public int     quantity   = 1;
        public boolean needsContext;         // true = không extract được tên, cần hỏi lại user

        /** Match đủ tin cậy để xử lý. */
        public boolean isResolved() {
            return resolvedProductName != null
                    && resolvedScore >= FuzzyProductMatcher.THRESHOLD;
        }

        @Override
        public String toString() {
            return String.format(
                    "ParsedCartAction{keyword='%s', resolved='%s'(%.3f), size=%s, qty=%d, needsCtx=%b}",
                    productKeyword, resolvedProductName, resolvedScore, size, quantity, needsContext);
        }
    }

    // ── Main parse ────────────────────────────────────────────────────────────

    /**
     * @param prompt          câu gốc (đã qua co-reference resolution từ ChatController)
     * @param englishQuery    bản dịch tiếng Anh để embed Qdrant (null → skip, dùng productName)
     * @param allProductNames toàn bộ tên sản phẩm (fallback khi vector search trả ít)
     */
    public ParsedCartAction parse(String prompt, String englishQuery,
                                  List<String> allProductNames) {
        ParsedCartAction result = new ParsedCartAction();

        // ── Layer 2: Entity Extraction ────────────────────────────────────────
        CartEntityExtractor.ExtractedEntities entities = entityExtractor.extract(prompt);

        result.size     = entities.size;
        result.quantity = Math.max(1, entities.quantity);

        // Nếu Groq không extract được tên (đại từ chỉ định / Groq fail)
        if (entities.fromContext || entities.productName.isBlank()) {
            result.productKeyword = "";
            result.needsContext   = true;
            System.out.println("[CartParser] No product name extracted → needsContext=true");
            return result; // Caller (CartActionService) sẽ xử lý fallback
        }

        result.productKeyword = entities.productName;
        result.needsContext   = false;

        // ── Layer 3: Context đã được resolve trước khi vào đây ───────────────
        // ChatController.resolveCoReference() đã thay "nó","cái đó" → tên thật
        // nên ở đây prompt đã "sạch", entity extractor sẽ pick được đúng tên

        // ── Layer 4a: Vector Search → candidates ─────────────────────────────
        // Ưu tiên englishQuery (chất lượng embedding tốt hơn tiếng Việt)
        // Fallback: dùng productName tiếng Việt từ Groq
        String vectorQuery = (englishQuery != null && !englishQuery.isBlank())
                ? englishQuery
                : entities.productName;

        List<String> candidates = List.of();
        if (!vectorQuery.isBlank()) {
            candidates = vectorStoreService.searchRelevant(vectorQuery, 10)
                    .stream()
                    .map(m -> (String) m.get("name"))
                    .filter(n -> n != null && !n.isBlank())
                    .collect(Collectors.toList());
        }

        // Nếu vector search miss → fallback toàn bộ danh sách
        if (candidates.isEmpty()) {
            System.out.println("[CartParser] Vector search returned 0 → fallback to allProductNames");
            candidates = allProductNames;
        }

        // ── Layer 4b: FuzzyMatcher → best match ──────────────────────────────
        if (!candidates.isEmpty()) {
            FuzzyProductMatcher.MatchResult best =
                    fuzzyMatcher.findBest(entities.productName, candidates);

            System.out.printf("[CartParser] Fuzzy '%s' → '%s' (score=%.3f, threshold=%.2f)%n",
                    entities.productName, best.name, best.score, FuzzyProductMatcher.THRESHOLD);

            result.resolvedProductName = best.name;
            result.resolvedScore       = best.score;

            // ── Fallback LLM: score thấp → needsContext để caller hỏi rõ hơn ──
            if (!best.isAccepted()) {
                System.out.printf("[CartParser] Score %.3f < threshold → needsContext=true%n",
                        best.score);
                result.needsContext = true;
            }
        } else {
            result.needsContext = true;
        }

        System.out.println("[CartParser] Result: " + result);
        return result;
    }

    // ── Overloads tương thích ngược ───────────────────────────────────────────

    /** Không có englishQuery — vector search bằng tiếng Việt. */
    public ParsedCartAction parse(String prompt, List<String> allProductNames) {
        return parse(prompt, null, allProductNames);
    }

    /** Legacy overload — không có product list (dùng vector search only). */
    public ParsedCartAction parse(String prompt) {
        return parse(prompt, null, List.of());
    }
}