package com.example.AMRadioServer.config;

import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@ControllerAdvice
public class SpotifyExceptionHandler {

    private final SpotifyApi spotifyApi;

    @Autowired
    public SpotifyExceptionHandler(SpotifyApi spotifyApi) {
        this.spotifyApi = spotifyApi;
    }

    /**
     * Gets new valid access/refresh tokens and sets them to the api
     *
     * @return a valid access token
     */
    private void newTokens() throws SpotifyWebApiException {
        String clientID = spotifyApi.getClientId();
        String clientSecret = spotifyApi.getClientSecret();
        String refreshToken = spotifyApi.getRefreshToken();

        if(refreshToken == null || clientID == null || clientSecret == null) {
            throw new SpotifyWebApiException("No refresh token found");
        }

        try {
            AuthorizationCodeCredentials auth = spotifyApi.authorizationCodeRefresh(clientID, clientSecret, refreshToken).build().execute();
            this.spotifyApi.setAccessToken(auth.getAccessToken());
            this.spotifyApi.setRefreshToken(auth.getRefreshToken());
        }
        catch(ParseException | IOException | SpotifyWebApiException e) {
            System.out.println("Exception in newTokens");
            System.out.println(e.getMessage());
            throw new SpotifyWebApiException("No refresh token found");
        }
    }

    /**
     * All SpotifyWebApiExceptions will trigger this function, which will attempt to
     * refresh access tokens or redirect to the front landing page
     *
     * @param e exception called
     * @param request incoming request
     * @param response outgoing response
     * @return redirect or null
     */
    @ExceptionHandler(value = {SpotifyWebApiException.class})
    public String redirect(SpotifyWebApiException e, HttpServletRequest request, HttpServletResponse response) {
        // Catches Exception from newTokens()
        if(e.getMessage().equals("No refresh token found")) {
            return "redirect:" + SpotifyConfiguration.url;
        }

        // Catches invalid access tokens
        if(e.getMessage().equals("Invalid access token") || e.getMessage().equals("The access token expired")) {
            try {
                this.newTokens();
                return null;
            } catch (Exception g) {
                return "redirect:" + SpotifyConfiguration.url;
            }
        }

        // Catches play/pause requests when already playing/paused
        if(e.getMessage().equals("Player command failed: Restriction violated")) {
            return null;
        }

        System.out.println(request.getRequestURL());
        System.out.println("SpotifyExceptionHandler: " + e.getMessage());
        return null;
    }
}
