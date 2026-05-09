package fit.iuh.orderservice.controller;

import fit.iuh.orderservice.dto.request.SizeDetailRequest;
import fit.iuh.orderservice.dto.request.UpdateSizeDetailRequest;
import fit.iuh.orderservice.dto.response.SizeDetailResponse;
import fit.iuh.orderservice.service.SizeDetailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/size-details")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SizeDetailController {
    SizeDetailService sizeDetailService;

    @GetMapping("/find")
    public SizeDetailResponse getSizeDetailByProductAndSize(@RequestParam("productId") int productId,
                                                            @RequestParam("sizeId") int sizeId) {
        SizeDetailRequest request = SizeDetailRequest.builder()
                .productId(productId)
                .sizeId(sizeId)
                .build();
        return sizeDetailService.findByProductAndSize(request);
    }

    @PutMapping("/quantity")
    public void updateSizeDetailQuantity(@RequestBody UpdateSizeDetailRequest updateSizeDetailRequest) {
        sizeDetailService.updateQuantity(updateSizeDetailRequest);
    }
}