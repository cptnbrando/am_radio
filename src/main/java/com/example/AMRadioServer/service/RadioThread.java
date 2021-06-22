package com.example.AMRadioServer.service;

import com.example.AMRadioServer.model.Station;
import lombok.Data;
import org.springframework.stereotype.Service;

/**
 * Runnable thread class for a radio to loop and update fields
 */
@Service
@Data
public class RadioThread implements Runnable {

    private StationService stationService;
    private int stationNum;

    public RadioThread(StationService stationService) {
        this.stationService = stationService;
    }

    /**
     * Here we use a while loop that checks if there are any listeners.
     * If so, we get the current listeners, and check if the track has finished playing.
     * If so, we set the current track to the next, and set the next track to a new one.
     *
     * When an object implementing interface <code>Runnable</code> is used
     * to create a thread, starting the thread causes the object's
     * <code>run</code> method to be called in that separately executing
     * thread.
     * <p>
     * The general contract of the method <code>run</code> is that it may
     * take any action whatsoever.
     *
     * @see Thread#run()
     */
    @Override
    public void run() {
        Station station = stationService.getStation(stationNum, true);

        // The Station is playing now
        station.setPlaying(true);

        // This saves it to db and HashMap
        stationService.updateStation(station);

        // Here we use a while loop to continue getting new songs as long as there are present listeners
        // We want to wait until the current system time is past the playTime + currentTrack time
        while(!station.getListeners().isEmpty()) {
            // We don't have to check the DB every loop, just get it from the HashMap
            station = stationService.getStation(stationNum);

            // If the SystemTime is greater than the PlayTime + current track elapsed time, update the station
            assert station.getCurrent() != null;
            if(System.currentTimeMillis() >= (station.getPlayTime() + station.getCurrent().getDurationMs()))
            {
                stationService.updateStation(station);
            }
        }

        // When the while loop exists, it means nobody is listening to the station, so stop the station
        station.stop();
        System.out.println("Stopped radio #" + stationNum);

        // Save the stopped Station to HashMap and db
        stationService.getAllStations().put(station.getStationID(), station);
        stationService.getStationRepo().save(station);
    }
}
