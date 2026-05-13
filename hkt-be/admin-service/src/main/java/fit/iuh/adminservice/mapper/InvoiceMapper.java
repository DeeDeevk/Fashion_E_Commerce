package fit.iuh.adminservice.mapper;

import fit.iuh.adminservice.dto.response.InvoiceResponse;
import fit.iuh.adminservice.entities.Invoice;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {
    InvoiceResponse toInvoiceMapper(Invoice invoice);

}
