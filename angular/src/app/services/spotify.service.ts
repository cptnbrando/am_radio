import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppComponent } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  private serverURL = `${AppComponent.serverRoot}/api/spotify`;
  private webURL = `${AppComponent.webURL}`;

  constructor(private httpCli:HttpClient) { }

  getSession(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + `/getSession`);
  }

  getCodeURL(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + `/login`);
  }

  setAccess(code: string): Observable<any>{
    return this.httpCli.put<any>(this.serverURL + `/setAccess`, code);
  }

  getNewTokens(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/newTokens");
  }

  loginSpotify(myURL: string): Observable<any>{
    return this.httpCli.get<any>(myURL, {observe: "response"});
  }

  logoutUser(): void{
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.replace(this.webURL);
  }

  checkTokens(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/checkTokens");
  }

  getUser(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/getUser");
  }

  getUserPlaylists(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + `/getUserPlaylists`);
  }

  getPlaylistTracks(playlistID: string): Observable<any[]>{
    return this.httpCli.get<any[]>(this.serverURL + `/getPlaylistTracks/?playlistID=${playlistID}`);
  }

  getDevices(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/player/getDevices");
  }

  getRecentlyPlayed(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/getRecentlyPlayed");
  }

  getRecentlyPlayedTracks(): Observable<any> {
    return this.httpCli.get<any>(this.serverURL + "/getRecentlyPlayedTracks");
  }

  getAudioFeatures(trackID: string): Observable<any> {
    return this.httpCli.get<any>(`${this.serverURL}/getAudioFeatures?trackID=${trackID}`);
  }

  getAudioAnalysis(trackID: string): Observable<any> {
    return this.httpCli.get<any>(`${this.serverURL}/getAudioAnalysis?trackID=${trackID}`);
  }

  checkLovedTrack(trackID: string): Observable<boolean> {
    return this.httpCli.get<boolean>(`${this.serverURL}/${trackID}/checkLoved`);
  }

  loveTrack(trackID: string): Observable<any> {
    return this.httpCli.post<any>(`${this.serverURL}/${trackID}/love`, trackID);
  }

  unloveTrack(trackID: string): Observable<any> {
    return this.httpCli.post<any>(`${this.serverURL}/${trackID}/unlove`, trackID);
  }
}
