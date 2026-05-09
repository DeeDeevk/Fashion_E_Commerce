package fit.iuh.orderservice.service;

import fit.iuh.orderservice.dto.request.SizeDetailRequest;
import fit.iuh.orderservice.dto.request.UpdateSizeDetailRequest;
import fit.iuh.orderservice.dto.response.SizeDetailResponse;
import fit.iuh.orderservice.entities.Product;
import fit.iuh.orderservice.entities.Size;
import fit.iuh.orderservice.entities.SizeDetail;
import fit.iuh.orderservice.exception.AppException;
import fit.iuh.orderservice.exception.ErrorCode;
import fit.iuh.orderservice.mapper.SizeDetailMapper;
import fit.iuh.orderservice.repository.ProductRepository;
import fit.iuh.orderservice.repository.SizeDetailRepository;
import fit.iuh.orderservice.repository.SizeRepository;
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
        Product product =  productRepository.findById(sizeDetailRequest.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        Size size = sizeRepository.findById(sizeDetailRequest.getSizeId())
                .orElseThrow(() -> new AppException(ErrorCode.SIZE_NOT_FOUND));

        SizeDetail sizeDetail = sizeDetailRepository.findSizeDetailByProductAndSize(product, size);

        return sizeDetailMapper.toSizeDetailMapper(sizeDetail);
    }

    public SizeDetailResponse findById(int sizeId) {
         SizeDetail sizeDetail = sizeDetailRepository.findById(sizeId)
                 .orElseThrow(() -> new AppException(ErrorCode.SIZE_DETAIL_NOT_FOUND));

         return sizeDetailMapper.toSizeDetailMapper(sizeDetail);
    }

    public void updateQuantity(UpdateSizeDetailRequest updateSizeDetailRequest) {
        Product product = productRepository.findById(updateSizeDetailRequest.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        Size size = sizeRepository.findById(updateSizeDetailRequest.getSizeId())
                .orElseThrow(() -> new AppException(ErrorCode.SIZE_NOT_FOUND));
        SizeDetail sizeDetail = sizeDetailRepository.findSizeDetailByProductAndSize(product, size);
        sizeDetail.setQuantity(sizeDetail.getQuantity() - updateSizeDetailRequest.getQuantity());
        sizeDetailRepository.save(sizeDetail);

    }
}