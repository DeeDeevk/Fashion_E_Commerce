package fit.iuh.userservice.mapper;

import fit.iuh.userservice.dto.response.InvoiceResponse;
import fit.iuh.userservice.entities.Invoice;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {
    InvoiceResponse toInvoiceMapper(Invoice invoice);

}
