package fit.iuh.orderservice.mapper;

import fit.iuh.orderservice.dto.response.InvoiceResponse;
import fit.iuh.orderservice.entities.Invoice;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {
    InvoiceResponse toInvoiceMapper(Invoice invoice);

}
