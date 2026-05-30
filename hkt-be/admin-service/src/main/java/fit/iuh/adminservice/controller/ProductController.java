// Updated ProductController.java
package fit.iuh.adminservice.controller;

import fit.iuh.adminservice.dto.request.ProductRequest;
import fit.iuh.adminservice.dto.response.ApiResponse;
import fit.iuh.adminservice.dto.response.ProductResponse;
import fit.iuh.adminservice.dto.response.TopProductResponse;
import fit.iuh.adminservice.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;


@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {
    ProductService productService;

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

    @GetMapping("/paged")
    public Page<ProductResponse> getAllProductsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return productService.getAllProductsPaged(PageRequest.of(page, size, sort), search, category, status);
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

}

