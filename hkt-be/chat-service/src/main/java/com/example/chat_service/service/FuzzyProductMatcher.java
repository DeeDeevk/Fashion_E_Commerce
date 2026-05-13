package com.example.chat_service.service;   // ← service package, dùng chung

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Single source of truth cho fuzzy matching trong toàn app.
 *
 * Được dùng ở 2 nơi:
 *   1. ChatController.findByKeyword()  — thay thế similarity() + levenshtein() nội bộ
 *   2. CartActionParser.parse()        — resolve tên sản phẩm từ lệnh giỏ hàng
 *
 * Thuật toán: 0.45 × Levenshtein + 0.45 × FuzzyTokenOverlap + 0.2 substring bonus
 */
@Component
public class FuzzyProductMatcher {

    /** Ngưỡng chung — dùng cho cart (chấp nhận match mơ hồ hơn). */
    public static final double THRESHOLD = 0.45;

    /** Ngưỡng chặt hơn — dùng cho keyword search trong ChatController. */
    public static final double KEYWORD_THRESHOLD = 0.75;

    // ── Public API ────────────────────────────────────────────────────────────

    public static class MatchResult {
        public final String name;
        public final double score;

        public MatchResult(String name, double score) {
            this.name  = name;
            this.score = score;
        }

        /** Dùng cho cart intent (ngưỡng 0.45). */
        public boolean isAccepted()        { return score >= THRESHOLD; }

        /** Dùng cho keyword search (ngưỡng 0.75). */
        public boolean isKeywordAccepted() { return score >= KEYWORD_THRESHOLD; }

        @Override
        public String toString() {
            return String.format("MatchResult{name='%s', score=%.3f}", name, score);
        }
    }

    /**
     * Tìm sản phẩm gần nhất với userInput.
     * Dùng trong CartActionParser.
     */
    public MatchResult findBest(String userInput, List<String> productNames) {
        if (userInput == null || userInput.isBlank()
                || productNames == null || productNames.isEmpty())
            return new MatchResult("", 0.0);

        String query = normalize(userInput);
        return productNames.stream()
                .map(name -> new MatchResult(name, score(query, normalize(name))))
                .max(Comparator.comparingDouble(r -> r.score))
                .orElse(new MatchResult("", 0.0));
    }

    /**
     * Top-K kết quả vượt ngưỡng THRESHOLD.
     * Dùng trong CartActionParser khi cần gợi ý nhiều lựa chọn.
     */
    public List<MatchResult> findTopK(String userInput, List<String> productNames, int k) {
        if (userInput == null || userInput.isBlank()) return List.of();
        String query = normalize(userInput);
        return productNames.stream()
                .map(name -> new MatchResult(name, score(query, normalize(name))))
                .filter(MatchResult::isAccepted)
                .sorted(Comparator.comparingDouble((MatchResult r) -> r.score).reversed())
                .limit(k)
                .collect(Collectors.toList());
    }

    /**
     * Kiểm tra keyword có "gần khớp" với target không.
     * Thay thế similarity() trong ChatController.findByKeyword().
     *
     * @param keyword   từ khóa (đã lowercase)
     * @param target    tên sản phẩm hoặc 1 token của tên
     * @param threshold dùng KEYWORD_THRESHOLD (0.75) cho keyword search
     */
    public boolean fuzzyContains(String keyword, String target, double threshold) {
        if (keyword == null || target == null) return false;
        String nk = normalize(keyword);
        String nt = normalize(target);
        if (nt.contains(nk)) return true;            // exact contain → nhanh hơn
        return levenshteinScore(nk, nt) >= threshold;
    }

    // ── Scoring ───────────────────────────────────────────────────────────────

    double score(String query, String candidate) {
        double lev     = levenshteinScore(query, candidate);
        double overlap = tokenOverlapScore(query, candidate);
        double bonus   = candidate.contains(query) ? 0.2 : 0.0;
        return Math.min(1.0, 0.45 * lev + 0.45 * overlap + bonus);
    }

    public double levenshteinScore(String a, String b) {
        int maxLen = Math.max(a.length(), b.length());
        if (maxLen == 0) return 1.0;
        return 1.0 - (double) levenshtein(a, b) / maxLen;
    }

    double tokenOverlapScore(String a, String b) {
        Set<String> tokensA = tokens(a);
        Set<String> tokensB = tokens(b);
        if (tokensA.isEmpty() && tokensB.isEmpty()) return 1.0;
        if (tokensA.isEmpty() || tokensB.isEmpty()) return 0.0;

        Set<String> union = new HashSet<>(tokensA);
        union.addAll(tokensB);

        long fuzzyIntersect = tokensA.stream()
                .filter(ta -> tokensB.stream()
                        .anyMatch(tb -> levenshteinScore(ta, tb) >= 0.75))
                .count();

        return (double) fuzzyIntersect / union.size();
    }

    // ── Helpers (public để CartActionParser dùng trực tiếp nếu cần) ──────────

    public String normalize(String s) {
        return s.toLowerCase()
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    Set<String> tokens(String s) {
        if (s == null || s.isBlank()) return Set.of();
        return Arrays.stream(s.split("\\s+"))
                .filter(t -> t.length() > 1)
                .collect(Collectors.toSet());
    }

    public int levenshtein(String a, String b) {
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1),
                        dp[i-1][j-1] + cost);
            }
        }
        return dp[m][n];
    }
}