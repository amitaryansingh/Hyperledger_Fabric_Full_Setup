package com.land.backend.repository;

import com.land.backend.model.LandParcel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandParcelRepository extends JpaRepository<LandParcel, Long> {

    // Spring Data JPA will automatically implement this method for us
    // based on the method name. It allows us to find a parcel by its
    // unique survey number.
    Optional<LandParcel> findBySurveyNumber(String surveyNumber);
}