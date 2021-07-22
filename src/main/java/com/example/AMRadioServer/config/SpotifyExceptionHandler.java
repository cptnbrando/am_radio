package com.example.AMRadioServer.config;

import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.exceptions.SpotifyWebApiException;
import com.wrapper.spotify.model_objects.credentials.AuthorizationCodeCredentials;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeRefreshRequest;
import com.wrapper.spotify.requests.authorization.authorization_code.AuthorizationCodeRequest;
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
//        System.out.println("Begin newTokens()");
        String clientID = spotifyApi.getClientId();
        String clientSecret = spotifyApi.getClientSecret();
        String refreshToken = spotifyApi.getRefreshToken();

        System.out.println("Gotten fields newTokens()");

        if(refreshToken == null || clientID == null || clientSecret == null) {
            throw new SpotifyWebApiException("No refresh token found");
        }

//        System.out.println("In newTokens()");

        try {
            System.out.println("Trying new tokens");
            final AuthorizationCodeRefreshRequest authRequest = spotifyApi.authorizationCodeRefresh(clientID, clientSecret, refreshToken).build();
            AuthorizationCodeCredentials auth = authRequest.executeAsync().get();
            System.out.println("Built auth refresh request");
            System.out.println(auth);
            System.out.println(auth.getAccessToken());
//            final Future<AuthorizationCodeCredentials> authFuture = authRequest.executeAsync();
//            final AuthorizationCodeCredentials auth = authFuture.get();
            this.spotifyApi.setAccessToken(auth.getAccessToken());
            this.spotifyApi.setRefreshToken(auth.getRefreshToken());
        }
        catch(InterruptedException | ExecutionException e) {
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
//                System.out.println("Attempting to get new tokens");
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
