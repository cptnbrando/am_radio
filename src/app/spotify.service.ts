import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {

  private spotifyURL = `https://api.spotify.com/`;
  private accountsURL = `https://accounts.spotify.com/`;
  private serverURL = `http://localhost:9015/`;

  constructor(private httpCli:HttpClient) { }

  getCodeURL(): Observable<any>{
    let url = this.serverURL + `api/spotify/login`;

    return this.httpCli.get<any>(url);
  }

  loginUser(myURL: string): Observable<any>{
    return this.httpCli.get<any>(myURL);
  }

  logoutUser(): void{
    localStorage.removeItem("token");
  }

  getUserPlaylists(): Observable<any>{
    let url = this.serverURL + `api/spotify/getUserPlaylists`;

    return this.httpCli.get<any>(url);
  }
}
