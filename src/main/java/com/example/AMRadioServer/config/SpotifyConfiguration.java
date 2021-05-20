package com.example.AMRadioServer.config;

import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.SpotifyHttpManager;
import lombok.Getter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.context.annotation.SessionScope;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.net.URI;

@Configuration
public class SpotifyConfiguration {

    private static final URI redirectURI = SpotifyHttpManager.makeUri("http://localhost:9015/api/spotify/getUserCode");

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
