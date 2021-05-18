package com.example.AMRadioServer.repository;

import com.wrapper.spotify.SpotifyApi;
import com.wrapper.spotify.SpotifyHttpManager;
import lombok.Getter;
import org.springframework.stereotype.Repository;

import java.net.URI;

@Repository
public class SpotifyRepository {
    private static final URI redirectURI = SpotifyHttpManager.makeUri("http://localhost:9015/api/spotify/getUserCode");

    private @Getter
    static final SpotifyApi spotifyApi = new SpotifyApi.Builder()
            .setClientId(System.getenv("SPOTIFY_CLI_ID"))
            .setClientSecret(System.getenv("SPOTIFY_CLI_SECRET"))
            .setRedirectUri(redirectURI)
            .build();
}
