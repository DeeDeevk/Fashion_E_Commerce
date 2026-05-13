package fit.iuh.product_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryRevenueResponse implements Serializable {
    private String name;
    private long value;     // số lượng sản phẩm
    private double revenue; // tổng doanh thu
    private String color;
}