package com.example.AMRadioServer.config;

import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.SpotifyHttpManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.annotation.SessionScope;

import java.net.URI;

// Maybe I should do more with this class... ah well lol
@Configuration
public class SpotifyConfiguration {

    public static String url = System.getenv("RADIO_APP_URL");
    private static final URI redirectURI = SpotifyHttpManager.makeUri(System.getenv("RADIO_APP_URL") + "/api/spotify/getUserCode");
    public static String appURL = url + "/app";

    @Bean
    @SessionScope
    public SpotifyApi spotifyApi() {
        System.out.println(SpotifyConfiguration.redirectURI);
        System.out.println(SpotifyConfiguration.appURL);
        return new SpotifyApi.Builder()
                .setClientId(System.getenv("SPOTIFY_CLI_ID"))
                .setClientSecret(System.getenv("SPOTIFY_CLI_SECRET"))
                .setRedirectUri(redirectURI)
                .build();
    }
}
