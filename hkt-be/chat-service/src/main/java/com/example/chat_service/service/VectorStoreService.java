package com.example.chat_service.service;

import com.example.chat_service.entities.Product;
import io.qdrant.client.QdrantClient;
import io.qdrant.client.QdrantGrpcClient;
import io.qdrant.client.grpc.Collections.*;
import io.qdrant.client.grpc.JsonWithInt;
import io.qdrant.client.grpc.Points.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

import static io.qdrant.client.PointIdFactory.id;
import static io.qdrant.client.ValueFactory.value;
import static io.qdrant.client.VectorsFactory.vectors;
import static io.qdrant.client.WithPayloadSelectorFactory.enable;

@Service
public class VectorStoreService {

    private static final String COLLECTION = "products";
    private static final int VECTOR_SIZE = 1024;

    private final QdrantClient qdrantClient;
    private final EmbeddingService embeddingService;

    public VectorStoreService(
            EmbeddingService embeddingService,
            @Value("${qdrant.host:localhost}") String qdrantHost,
            @Value("${qdrant.port:6334}") int qdrantPort)
            throws ExecutionException, InterruptedException {
        this.embeddingService = embeddingService;
        this.qdrantClient = new QdrantClient(
                QdrantGrpcClient.newBuilder(qdrantHost, qdrantPort, false).build()
        );
        initCollection();
    }

    private void initCollection() throws ExecutionException, InterruptedException {
        boolean exists = qdrantClient.collectionExistsAsync(COLLECTION).get();
        if (!exists) {
            qdrantClient.createCollectionAsync(
                    CreateCollection.newBuilder()
                            .setCollectionName(COLLECTION)
                            .setVectorsConfig(VectorsConfig.newBuilder()
                                    .setParams(VectorParams.newBuilder()
                                            .setSize(VECTOR_SIZE)
                                            .setDistance(Distance.Cosine)
                                            .build())
                                    .build())
                            .build()
            ).get();
            System.out.println("✅ Created Qdrant collection: " + COLLECTION);
        } else {
            System.out.println("✅ Qdrant collection exists: " + COLLECTION);
        }
    }

    public void upsertProduct(Product product) {
        String text = buildProductText(product);
        List<Float> vector = embeddingService.embed(text);

        String category = "";
        try { category = product.getCategory() != null ? product.getCategory().getName() : ""; }
        catch (Exception e) { category = ""; }

        String sizes = buildSizeText(product);

        Map<String, JsonWithInt.Value> payload = new HashMap<>();
        payload.put("id",              value((long) product.getId()));
        payload.put("name",            value(product.getName()));
        payload.put("price",           value(product.getCostPrice()));
        payload.put("brand",           value(product.getBrand()       != null ? product.getBrand()       : ""));
        payload.put("material",        value(product.getMaterial()    != null ? product.getMaterial()    : ""));
        payload.put("form",            value(product.getForm()        != null ? product.getForm()        : ""));
        payload.put("description",     value(product.getDescription() != null ? product.getDescription() : ""));
        payload.put("rating",          value(product.getRating()));
        payload.put("discount_amount", value(product.getDiscountAmount()));
        payload.put("quantity",        value((long) product.getQuantity()));
        payload.put("category",        value(category));
        payload.put("sizes",           value(sizes));

        PointStruct point = PointStruct.newBuilder()
                .setId(id(product.getId()))
                .setVectors(vectors(vector))
                .putAllPayload(payload)
                .build();

        try {
            qdrantClient.upsertAsync(COLLECTION, List.of(point)).get();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Nhận englishQuery đã translate từ ChatController, KHÔNG translate lại
    public List<Map<String, Object>> searchRelevant(String englishQuery, int topK) {
        List<Float> queryVector = embeddingService.embed(englishQuery);

        try {
            List<ScoredPoint> results = qdrantClient.searchAsync(
                    SearchPoints.newBuilder()
                            .setCollectionName(COLLECTION)
                            .addAllVector(queryVector)
                            .setLimit(topK)
                            .setScoreThreshold(0.3f)
                            .setWithPayload(enable(true))
                            .build()
            ).get();

            results.forEach(p ->
                    System.out.printf("Found: %s | score: %.3f%n",
                            p.getPayloadMap().get("name").getStringValue(),
                            p.getScore())
            );

            return results.stream()
                    .map(point -> {
                        Map<String, JsonWithInt.Value> pl = point.getPayloadMap();
                        Map<String, Object> m = new HashMap<>();
                        m.put("name",            pl.get("name").getStringValue());
                        m.put("price",           pl.get("price").getDoubleValue());
                        m.put("material",        pl.getOrDefault("material",        value("")).getStringValue());
                        m.put("form",            pl.getOrDefault("form",            value("")).getStringValue());
                        m.put("description",     pl.getOrDefault("description",     value("")).getStringValue());
                        m.put("rating",          pl.getOrDefault("rating",          value(0.0)).getDoubleValue());
                        m.put("discount_amount", pl.getOrDefault("discount_amount", value(0.0)).getDoubleValue());
                        m.put("quantity",        pl.getOrDefault("quantity",        value(0L)).getIntegerValue());
                        m.put("category",        pl.getOrDefault("category",        value("")).getStringValue());
                        m.put("sizes",           pl.getOrDefault("sizes",           value("")).getStringValue());
                        m.put("score",           point.getScore());
                        return m;
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    private String buildSizeText(Product p) {
        if (p.getSizeDetails() == null) return "hết hàng";
        String sizes = p.getSizeDetails().stream()
                .filter(sd -> sd.getQuantity() > 0)
                .map(sd -> sd.getSize().getNameSize().toString())
                .collect(Collectors.joining(", "));
        return sizes.isEmpty() ? "hết hàng" : sizes;
    }

    private String buildProductText(Product p) {
        String category = "";
        try { category = p.getCategory() != null ? p.getCategory().getName() : ""; }
        catch (Exception e) { category = ""; }

        String description = p.getDescription() != null ? p.getDescription() : "";
        String material    = p.getMaterial()    != null ? p.getMaterial()     : "";
        String form        = p.getForm()        != null ? p.getForm()         : "";
        String brand       = p.getBrand()       != null ? p.getBrand()        : "";
        String sizes       = buildSizeText(p);
        String discount    = p.getDiscountAmount() > 0
                ? "có giảm giá " + (int) p.getDiscountAmount() + "%" : "không giảm giá";
        String stock       = p.getQuantity() > 0 ? "còn hàng" : "hết hàng";

        // VI keywords từ tên sản phẩm
        Map<String, String> colorMap = new LinkedHashMap<>();
        colorMap.put("Green",  "xanh lá");   colorMap.put("Blue",  "xanh dương");
        colorMap.put("Red",    "đỏ");         colorMap.put("Black", "đen");
        colorMap.put("White",  "trắng");      colorMap.put("Brown", "nâu");
        colorMap.put("Grey",   "xám");        colorMap.put("Cream", "kem");
        colorMap.put("Navy",   "xanh navy");  colorMap.put("Tan",   "nâu vàng");

        Map<String, String> typeMap = new LinkedHashMap<>();
        typeMap.put("Tee",      "áo thun");   typeMap.put("Jeans",   "quần jeans");
        typeMap.put("Jorts",    "quần short jeans"); typeMap.put("Pants", "quần dài");
        typeMap.put("Shorts",   "quần short"); typeMap.put("Shirt",  "áo sơ mi");
        typeMap.put("Cap",      "mũ");         typeMap.put("Wallet", "ví");
        typeMap.put("Polo",     "áo polo");    typeMap.put("Jersey", "áo jersey");
        typeMap.put("Bag",      "túi");        typeMap.put("Necklace","vòng cổ");
        typeMap.put("Slides",   "dép");        typeMap.put("Sweatpants","quần sweater");
        typeMap.put("Cargo",    "quần cargo"); typeMap.put("Trouser","quần tây");

        Map<String, String> materialMap = new LinkedHashMap<>();
        materialMap.put("Cotton",  "vải cotton");  materialMap.put("Denim", "vải denim");
        materialMap.put("Leather", "da");           materialMap.put("Knit",  "len dệt kim");
        materialMap.put("Linen",   "vải lanh");     materialMap.put("Pique", "cotton pique");

        StringBuilder viKeywords = new StringBuilder();
        colorMap.forEach((en, vi) -> { if (p.getName().contains(en) || description.contains(en)) viKeywords.append(vi).append(" "); });
        typeMap.forEach((en, vi)  -> { if (p.getName().contains(en)) viKeywords.append(vi).append(" "); });
        materialMap.forEach((en, vi) -> { if (material.contains(en)) viKeywords.append(vi).append(" "); });

        String result = String.format(
                "product: %s. category: %s. brand: %s. " +
                        "material: %s. form: %s. description: %s. " +
                        "price: %,.0f VND. discount: %s. stock: %s. sizes: %s. rating: %.1f. " +
                        "Vietnamese keywords: %s.",
                p.getName(), category, brand,
                material, form, description,
                p.getCostPrice(), discount, stock, sizes, p.getRating(),
                viKeywords.toString().trim()
        );

        System.out.println("=== EMBED TEXT ===\n" + result);
        return result;
    }
}