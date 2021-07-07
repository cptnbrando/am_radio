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

    private static final URI redirectURI = SpotifyHttpManager.makeUri("http://localhost:9015/api/spotify/getUserCode");
    public static final String appURL = "http://localhost:9015/app";

    @Bean
    @SessionScope
    public SpotifyApi spotifyApi() {
        return new SpotifyApi.Builder()
                .setClientId(System.getenv("SPOTIFY_CLI_ID"))
                .setClientSecret(System.getenv("SPOTIFY_CLI_SECRET"))
                .setRedirectUri(redirectURI)
                .build();
    }
}
