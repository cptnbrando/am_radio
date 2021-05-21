import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  private spotifyURL = `https://api.spotify.com/`;
  private accountsURL = `https://accounts.spotify.com/`;
  private serverURL = `http://localhost:9015/api/spotify`;

  constructor(private httpCli:HttpClient) { }

  // USE THIS SO DEPLOYING WON't BE SO AWFUL
  get webURL() {
    return "http://localhost:4200";
  }

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

  getDevices(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/player/getDevices");
  }

  getRecentlyPlayedTrack(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/getRecentlyPlayed");
  }
}
