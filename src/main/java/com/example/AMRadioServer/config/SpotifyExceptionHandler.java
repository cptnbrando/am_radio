package com.example.AMRadioServer.config;

import se.michaelthelin.spotify.SpotifyApi;
import se.michaelthelin.spotify.exceptions.SpotifyWebApiException;
import se.michaelthelin.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import se.michaelthelin.spotify.requests.authorization.authorization_code.AuthorizationCodeRefreshRequest;
import se.michaelthelin.spotify.requests.authorization.authorization_code.AuthorizationCodeRequest;
import org.apache.hc.core5.http.ParseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

@ControllerAdvice
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
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

        // TODO: this sets it for this api, but the new access token needs to go to the player too...
        try {
            final AuthorizationCodeRefreshRequest authRequest = spotifyApi.authorizationCodeRefresh(clientID, clientSecret, refreshToken).build();
            AuthorizationCodeCredentials auth = authRequest.execute();
            this.spotifyApi.setAccessToken(auth.getAccessToken());
            this.spotifyApi.setRefreshToken(auth.getRefreshToken());
        }
        catch(IOException | ParseException e) {
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
        // Catches Exception from newTokens() and invalid access token
        if(e.getMessage().equals("No refresh token found") || e.getMessage().equals("Invalid access token")) {
            return "redirect:" + SpotifyConfiguration.url;
        }

        // Catches invalid access tokens
        if(e.getMessage().equals("The access token expired")) {
            try {
                System.out.println("Attempting to get new tokens");
                this.newTokens();
                return null;
            } catch (Exception g) {
                System.out.println("Caught in the access token expired");
                System.out.println(g.getMessage());
                return "redirect:" + SpotifyConfiguration.url;
            }
        }

        // Catches play/pause requests when already playing/paused
        if(e.getMessage().equals("Player command failed: Restriction violated")) {
            return null;
        }

        // Catches rate limit
        if(e.getMessage().equals("API rate limit exceeded")) {
            try {
                System.out.println("Rate: " + e.getMessage());
                Thread.sleep(5000);
                return null;
            } catch (InterruptedException interruptedException) {
                System.out.println("SpotifyExceptionHandler InterruptedException RateHandler:");
                interruptedException.printStackTrace();
                return null;
            }
        }

        System.out.println(request.getRequestURL());
        System.out.println("SpotifyExceptionHandler: " + e.getMessage());
        return null;
    }
}
