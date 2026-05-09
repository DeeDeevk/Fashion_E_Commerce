package fit.iuh.orderservice.dto.response;

import fit.iuh.orderservice.enums.Role;
import fit.iuh.orderservice.enums.StatusLogin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AccountResponse {
    int id;
    CustomerResponse customer;
    String username;
    Role role;
    Date createAt;
    Date updateAt;
    StatusLogin statusLogin;
}
