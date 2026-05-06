package fit.iuh.product_service.service;

import fit.iuh.product_service.dto.request.SizeDetailRequest;
import fit.iuh.product_service.dto.response.SizeDetailResponse;
import fit.iuh.product_service.entities.Product;
import fit.iuh.product_service.entities.Size;
import fit.iuh.product_service.entities.SizeDetail;
import fit.iuh.product_service.mapper.SizeDetailMapper;
import fit.iuh.product_service.repository.ProductRepository;
import fit.iuh.product_service.repository.SizeDetailRepository;
import fit.iuh.product_service.repository.SizeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;


@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor

public class SizeDetailService {
    SizeDetailRepository sizeDetailRepository;
    ProductRepository productRepository;
    SizeRepository sizeRepository;
    SizeDetailMapper sizeDetailMapper;

    public SizeDetailResponse findByProductAndSize(SizeDetailRequest sizeDetailRequest) {
        Product product = productRepository.findById(sizeDetailRequest.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Size size = sizeRepository.findById(sizeDetailRequest.getSizeId())
                .orElseThrow(() -> new RuntimeException("Size not found"));

        SizeDetail sizeDetail = sizeDetailRepository.findSizeDetailByProductAndSize(product, size);

        return sizeDetailMapper.toSizeDetailMapper(sizeDetail);
    }

    public SizeDetailResponse findById(int sizeId) {
         SizeDetail sizeDetail = sizeDetailRepository.findById(sizeId)
                 .orElseThrow(() -> new RuntimeException("Size detail not found"));

         return sizeDetailMapper.toSizeDetailMapper(sizeDetail);
    }
}