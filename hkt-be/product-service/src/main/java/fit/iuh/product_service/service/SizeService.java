package fit.iuh.product_service.service;


import fit.iuh.product_service.entities.Size;
import fit.iuh.product_service.enums.SizeName;
import fit.iuh.product_service.repository.SizeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor

public class SizeService {
    SizeRepository sizeRepository;

    public List<Size> getAllSizes() {
        return sizeRepository.findAll();
    }
    public Size getSizeByName(String sizeName) {
        SizeName nameSize = SizeName.valueOf(sizeName);
        return sizeRepository.findByNameSize(nameSize)
                .orElseThrow(() -> new RuntimeException("Size not found"));
    }

    public Size getSizeById(int id) {
        return sizeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Size not found"));
    }
}