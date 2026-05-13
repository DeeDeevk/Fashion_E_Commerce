package fit.iuh.product_service.service;

import fit.iuh.product_service.dto.request.ProductRequest;
import fit.iuh.product_service.dto.request.SizeDetailRequest;
import fit.iuh.product_service.dto.response.CategoryResponse;
import fit.iuh.product_service.dto.response.ProductResponse;
import fit.iuh.product_service.dto.response.ProductResponse.SizeDetailResponse;
import fit.iuh.product_service.dto.response.TopProductResponse;
import fit.iuh.product_service.entities.Category;
import fit.iuh.product_service.entities.Product;
import fit.iuh.product_service.entities.Size;
import fit.iuh.product_service.entities.SizeDetail;
import fit.iuh.product_service.enums.Status;
import fit.iuh.product_service.repository.CategoryRepository;
import fit.iuh.product_service.repository.ProductRepository;
import fit.iuh.product_service.repository.SizeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ProductService {

    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    SizeRepository sizeRepository;
    RestTemplate restTemplate;

    // Tên service đăng ký trên Eureka (phải khớp với spring.application.name của order-service)
    static String ORDER_SERVICE_URL = "http://order-service";

    // ==================== GET ALL ====================

    @Cacheable(value = "allProducts")
    public List<ProductResponse> getAllProducts() {

        System.out.println("GET PRODUCTS FROM MYSQL");

        List<Product> products = productRepository.findAll();

        Map<Integer, Long> soldMap = new HashMap<>();

        try {
            Map<String, Object> response = restTemplate.getForObject(
                    ORDER_SERVICE_URL + "/order-details/sold-quantity-all",
                    Map.class
            );
            System.out.println("Response từ order-service: " + response); // ← THÊM DÒNG NÀY

            if (response != null && response.containsKey("result")) {
                Map<String, Object> raw = (Map<String, Object>) response.get("result");

                raw.forEach((k, v) ->
                        soldMap.put(Integer.parseInt(k), ((Number) v).longValue()));
            }

        } catch (Exception e) {
            System.out.println("LỖI gọi order-service: " + e.getMessage()); // ← THÊM DÒNG NÀY
        }

        return products.stream()
                .map(product -> convertToProductResponse(
                        product,
                        soldMap.getOrDefault(product.getId(), 0L)))
                .collect(Collectors.toList());
    }

    // ==================== GET BY ID ====================
    @Cacheable(value = "product", key = "#id")
    public ProductResponse getProductById(int id) {

        System.out.println("GET PRODUCT ID " + id + " FROM MYSQL");

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));

        Long soldQuantity = 0L;

        try {
            Map<String, Object> response = restTemplate.getForObject(
                    ORDER_SERVICE_URL + "/order-details/sold-quantity?productId=" + id,
                    Map.class
            );

            if (response != null && response.containsKey("result")) {
                soldQuantity = ((Number) response.get("result")).longValue();
            }

        } catch (Exception e) {
            System.out.println("LỖI gọi order-service: " + e.getMessage()); // ← THÊM DÒNG NÀY
        }

        return convertToProductResponse(product, soldQuantity);
    }

    // ==================== GET BY IDs ====================

    @Cacheable(value = "productsByIds", key = "#ids")
    public List<ProductResponse> getProductsByIds(List<Integer> ids) {

        System.out.println("GET PRODUCTS BY IDS FROM MYSQL");

        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }

        List<Product> products = productRepository.findAllById(ids);

        Map<Integer, Long> soldMap = new HashMap<>();

        try {
            Map<String, Object> response = restTemplate.getForObject(
                    ORDER_SERVICE_URL + "/order-details/sold-quantity-all",
                    Map.class
            );

            if (response != null && response.containsKey("result")) {

                Map<String, Object> raw =
                        (Map<String, Object>) response.get("result");

                raw.forEach((k, v) ->
                        soldMap.put(Integer.parseInt(k),
                                ((Number) v).longValue()));
            }

        } catch (Exception e) {
            System.out.println("LỖI gọi order-service: " + e.getMessage()); // ← THÊM DÒNG NÀY
        }

        return products.stream()
                .map(product -> convertToProductResponse(
                        product,
                        soldMap.getOrDefault(product.getId(), 0L)))
                .collect(Collectors.toList());
    }

    // ==================== CREATE ====================

    @Caching(evict = {
            @CacheEvict(value = "allProducts", allEntries = true),
            @CacheEvict(value = "productsByIds", allEntries = true)
    })
    public ProductResponse createProduct(ProductRequest productRequest) {

        System.out.println("CREATE PRODUCT -> CLEAR REDIS CACHE");

        Product product = Product.builder()
                .name(productRequest.getName())
                .description(productRequest.getDescription())
                .price(productRequest.getPrice())
                .unit(productRequest.getUnit())
                .imageUrlFront(productRequest.getImageUrlFront())
                .imageUrlBack(productRequest.getImageUrlBack())
                .discountAmount(productRequest.getDiscountAmount())
                .material(productRequest.getMaterial())
                .form(productRequest.getForm())
                .build();

        Category category = categoryRepository.findByName(
                        productRequest.getCategoryRequest().getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        List<SizeDetail> sizeDetails = new ArrayList<>();

        productRequest.getSizeDetailRequests()
                .forEach(sizeDetailRequest -> {

                    SizeDetail sizeDetail = new SizeDetail();

                    Size size = sizeRepository.findByNameSize(
                                    sizeDetailRequest.getSizeRequest().getNameSize())
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Size not found"));

                    sizeDetail.setSize(size);
                    sizeDetail.setProduct(product);
                    sizeDetail.setQuantity(sizeDetailRequest.getQuantity());

                    sizeDetails.add(sizeDetail);
                });

        int quantity = sizeDetails.stream()
                .mapToInt(SizeDetail::getQuantity)
                .sum();

        double costPrice = productRequest.getPrice()
                - (productRequest.getPrice()
                * productRequest.getDiscountAmount() / 100);

        product.setCostPrice(costPrice);
        product.setRating(0.0);
        product.setQuantity(quantity);
        product.setSizeDetails(sizeDetails);
        product.setCategory(category);
        product.setBrand("HK3T");
        product.setStatus(Status.ACTIVE);

        product.setCreatedAt(Date.from(LocalDate.now()
                .atStartOfDay()
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()));

        product.setUpdatedAt(Date.from(LocalDate.now()
                .atStartOfDay()
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()));

        Product savedProduct = productRepository.save(product);

        return convertToProductResponse(savedProduct, 0L);
    }

    // ==================== UPDATE ====================

    @Caching(evict = {
            @CacheEvict(value = "allProducts", allEntries = true),
            @CacheEvict(value = "productsByIds", allEntries = true),
            @CacheEvict(value = "product", key = "#id")
    })
    public ProductResponse updateProduct(int id,
                                         ProductRequest productRequest) {

        System.out.println("UPDATE PRODUCT -> CLEAR REDIS CACHE");

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"));

        existingProduct.setName(productRequest.getName());
        existingProduct.setDescription(productRequest.getDescription());
        existingProduct.setPrice(productRequest.getPrice());
        existingProduct.setUnit(productRequest.getUnit());
        existingProduct.setImageUrlFront(productRequest.getImageUrlFront());
        existingProduct.setImageUrlBack(productRequest.getImageUrlBack());
        existingProduct.setDiscountAmount(productRequest.getDiscountAmount());
        existingProduct.setMaterial(productRequest.getMaterial());
        existingProduct.setForm(productRequest.getForm());
        existingProduct.setStatus(Status.ACTIVE);

        Category category = categoryRepository.findByName(
                        productRequest.getCategoryRequest().getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Category not found"));

        existingProduct.setCategory(category);

        List<SizeDetail> sizeDetails = existingProduct.getSizeDetails();

        List<SizeDetailRequest> requestedSizeDetails =
                productRequest.getSizeDetailRequests();

        for (SizeDetail sd : sizeDetails) {

            for (SizeDetailRequest sdr : requestedSizeDetails) {

                if (sd.getSize().getNameSize()
                        .equals(sdr.getSizeRequest().getNameSize())) {

                    sd.setQuantity(sdr.getQuantity());
                    break;
                }
            }
        }

        int quantity = sizeDetails.stream()
                .mapToInt(SizeDetail::getQuantity)
                .sum();

        double costPrice = productRequest.getPrice()
                - (productRequest.getPrice()
                * productRequest.getDiscountAmount() / 100);

        existingProduct.setCostPrice(costPrice);
        existingProduct.setQuantity(quantity);
        existingProduct.setSizeDetails(sizeDetails);
        existingProduct.setBrand("HK3T");

        existingProduct.setUpdatedAt(Date.from(LocalDate.now()
                .atStartOfDay()
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()));

        Product updatedProduct = productRepository.save(existingProduct);

        return convertToProductResponse(updatedProduct, 0L);
    }

    // ==================== DELETE ====================

    @Caching(evict = {
            @CacheEvict(value = "allProducts", allEntries = true),
            @CacheEvict(value = "productsByIds", allEntries = true),
            @CacheEvict(value = "product", key = "#id")
    })
    public void deleteProduct(int id) {

        System.out.println("DELETE PRODUCT -> CLEAR REDIS CACHE");

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found"));

        existingProduct.setStatus(Status.INACTIVE);

        productRepository.save(existingProduct);
    }

    // ==================== SALE PRODUCTS ====================

    public List<Product> getSaleProducts() {
        return productRepository.findByDiscountAmountGreaterThan(0.1);
    }

    // ==================== TOP TRENDING ====================
    // Gọi order-service để lấy top trending
    // Nếu order-service chưa có → trả về list rỗng, không crash

    @Cacheable(value = "topTrending", key = "#type")
    public List<TopProductResponse> getTopTrending(String type) {

        System.out.println("GET TOP TRENDING FROM MYSQL");

        try {

            Map[] rawList = restTemplate.getForObject(
                    ORDER_SERVICE_URL +
                            "/order-details/top-trending?type=" + type,
                    Map[].class
            );

            if (rawList == null) {
                return new ArrayList<>();
            }

            List<TopProductResponse> result = new ArrayList<>();

            for (Map raw : rawList) {

                Integer productId = (Integer) raw.get("productId");

                Product p = productRepository.findById(productId)
                        .orElse(null);

                if (p == null) continue;

                result.add(new TopProductResponse(
                        p.getName(),
                        p.getCategory() != null
                                ? p.getCategory().getName()
                                : "Unknown",
                        ((Number) raw.get("sales")).intValue(),
                        ((Number) raw.get("revenue")).doubleValue(),
                        (String) raw.get("trend"),
                        p.getImageUrlFront()
                ));
            }

            return result;

        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // ==================== DASHBOARD STATS ====================

    public Map<String, Long> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalProducts", productRepository.getTotalProducts());
        stats.put("lowStock", productRepository.getLowStockProducts(10));
        return stats;
    }

    // ==================== HELPER ====================

    private ProductResponse convertToProductResponse(Product product, Long soldQuantity) {
        List<SizeDetailResponse> sizeDetailResponses = product.getSizeDetails().stream()
                .map(sd -> SizeDetailResponse.builder()
                        .id(sd.getId())
                        .sizeName(sd.getSize().getNameSize().name())
                        .quantity(sd.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .unit(product.getUnit())
                .quantity(product.getQuantity())
                .imageUrlFront(product.getImageUrlFront())
                .imageUrlBack(product.getImageUrlBack())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .rating(product.getRating())
                .discountAmount(product.getDiscountAmount())
                .material(product.getMaterial())
                .form(product.getForm())
                .soldQuantity(soldQuantity)
                .status(product.getStatus())
                .category(CategoryResponse.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .imageUrl(product.getCategory().getImageUrl())
                        .build())
                .sizeDetails(sizeDetailResponses)
                .build();
    }
}