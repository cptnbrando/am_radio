package com.example.AMRadioServer.repository;

import com.example.AMRadioServer.model.Station;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.transaction.Transactional;

@Transactional
public interface StationRepository extends JpaRepository<Station, Integer>
{
    @Override
    boolean existsById(Integer stationID);

    boolean existsByStationURL(String stationURL);
}
