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

  getCodeURL(): Observable<any>{
    let url = this.serverURL + `/login`;

    return this.httpCli.get<any>(url);
  }

  loginUser(myURL: string): Observable<any>{
    return this.httpCli.get<any>(myURL);
  }

  logoutUser(): void{
    localStorage.removeItem("token");
  }

  getAccessToken(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/getAccessToken");
  }

  getUser(): Observable<any>{
    return this.httpCli.get<any>(this.serverURL + "/getUser");
  }

  getUserPlaylists(): Observable<any>{
    let url = this.serverURL + `/getUserPlaylists`;

    return this.httpCli.get<any>(url);
  }
}
