import { Subject } from 'rxjs';
import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { RadioPageComponent } from '../components/radio-page/radio-page.component';

export class WebSocketAPI {
    webSocketEndPoint: string;
    topic: string;
    stationNum: number;
    stompClient: Stomp.Client;
    radioPageComponent: RadioPageComponent;
    tempObs = new Subject<String>();

    constructor(radioPageComponent: RadioPageComponent) {
        this.radioPageComponent = radioPageComponent;
        this.webSocketEndPoint = "http://localhost:9015/ws";
        this.topic = "/topic/stations";
    }

    getObs(){
        return this.tempObs.asObservable();
    }

    // Connect to the WebSocket for the given station
    _connect(stationNum: number) {
        console.log("Start websocket connection");
        
        let ws = new SockJS(this.webSocketEndPoint);

        // This is stupid, but necessary because this.stompClient doesn't wanna work right :/
        const _this = this;
        console.log(ws);

        _this.stompClient = Stomp.over(ws);

        // Connect to the Stomp Client and subscribe to endpoints
        _this.stompClient.connect({
            withCredentials:true
        }, (frame) => {
            // Endpoint for getting Station updates (when to skip to next track)
            _this.stompClient.subscribe(`${_this.topic}`, function(sdkEvent) {
                console.log(sdkEvent);
                _this.onNext(sdkEvent);
            });
        }, (error) => _this.errorCallBack)
    };

    // Function to handle when the track is skipped
    onNext(message){
        console.log("Message Recieved from Server :: " + message.body);
        this.radioPageComponent.handleNext(JSON.parse(message.body));
    }
    
    // Callback for recieving a new listener
    onListenerRecieved(message) {
        console.log("New listener found");
        this.radioPageComponent.handleListener(JSON.parse(message.body));
    }

    // Send an update to add the user to the station's listeners list
    // _sendNewListener(stationNum, message) {
    //     this.stompClient.send(`/ws/stations/${stationNum}/listeners`, {}, JSON.stringify(message));
    // }
    
    // Disconnect from Stomp Client
    _disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect(()=>{});
        }
        console.log("Disconnected");
    }
    
    // Send to update backend listeners list
    _sendDisconnect(message) {
        this.stompClient.send("/app/disconnect", {}, JSON.stringify(message));
    }

    // on error, schedule a reconnection attempt
    errorCallBack(error, stationNum) {
        console.log("errorCallBack -> " + error);
        // setTimeout(() => {
            //     this._connect(stationNum);
        // }, 5000);
    }
}
