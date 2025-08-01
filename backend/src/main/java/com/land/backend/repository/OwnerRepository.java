package com.land.backend.repository;

import com.land.backend.model.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
    // We can add custom query methods here if needed in the future,
    // for example, findByAadhaar(String aadhaar);
}