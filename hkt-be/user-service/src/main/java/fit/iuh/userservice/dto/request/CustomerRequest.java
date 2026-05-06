package fit.iuh.userservice.dto.request;

import fit.iuh.userservice.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerRequest {
    private String fullName;
    private String phoneNumber;
    private String email;
    private Gender gender;
    private Date dateOfBirth;
}
