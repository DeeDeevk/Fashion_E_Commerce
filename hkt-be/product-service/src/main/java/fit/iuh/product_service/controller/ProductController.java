// Updated ProductController.java
package fit.iuh.product_service.controller;


import fit.iuh.product_service.dto.request.ProductRequest;
import fit.iuh.product_service.dto.response.ApiResponse;
import fit.iuh.product_service.dto.response.ProductResponse;
import fit.iuh.product_service.dto.response.TopProductResponse;
import fit.iuh.product_service.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {
    ProductService productService;

    @GetMapping("/paged")
    public ResponseEntity<Map<String, Object>> getProductsPaged(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(productService.getProductsPage(page, size));
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        ApiResponse<List<ProductResponse>> response = new ApiResponse<>();
        response.setResult(productService.getAllProducts());
        return response;
    }


    // THÊM: Endpoint cho chi tiết sản phẩm theo ID
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable int id) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.getProductById(id));
        return response;
    }
    @GetMapping("/batch")
    public ApiResponse<List<ProductResponse>> getProductsByIds(@RequestParam("ids") List<Integer> ids) {
        ApiResponse<List<ProductResponse>> response = new ApiResponse<>();

        if (ids == null || ids.isEmpty()) {
            // Trả về danh sách rỗng nếu không có ID nào
            response.setResult(Collections.emptyList());
            return response;
        }

        // Gọi tầng Service để lấy danh sách sản phẩm
        response.setResult(productService.getProductsByIds(ids));
        return response;
    }
    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@RequestBody ProductRequest productRequest) {
//        ApiResponse<ProductResponse> response = new ApiResponse<>();
//        response.setResult(productService.createProduct(productRequest));
//        return response;
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.createProduct(productRequest));
        return response;
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable int id, @RequestBody ProductRequest productRequest) {
        ApiResponse<ProductResponse> response = new ApiResponse<>();
        response.setResult(productService.updateProduct(id, productRequest));
        return response;
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteProduct(@PathVariable int id) {
        productService.deleteProduct(id);
        ApiResponse<String> response = new ApiResponse<>();
        response.setResult("Product deleted successfully");
        return response;
    }

    @GetMapping("/top-trending")
    public List<TopProductResponse> getTopTrending(
            @RequestParam(defaultValue = "week") String type) {
        return productService.getTopTrending(type);
    }

    @GetMapping("/stats")
    public ApiResponse<?> getStats() {
        return ApiResponse.<Object>builder()
                .result(productService.getDashboardStats())
                .build();
    }

    // ✅ THÊM endpoint filter + phân trang
    @GetMapping("/filter")
    public ResponseEntity<Map<String, Object>> getProductsFiltered(
            @RequestParam(defaultValue = "1")         int page,
            @RequestParam(defaultValue = "9")         int size,
            @RequestParam(defaultValue = "")          String search,
            @RequestParam(required = false)           Integer categoryId,
            @RequestParam(defaultValue = "0")         double minPrice,
            @RequestParam(defaultValue = "2000000")   double maxPrice,
            @RequestParam(defaultValue = "default")   String sortBy
    ) {
        return ResponseEntity.ok(productService.getProductsFiltered(
                page, size, search, categoryId, minPrice, maxPrice, sortBy));
    }

}

