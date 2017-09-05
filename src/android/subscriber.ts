import {Observable} from "data/observable";
import {ContentView} from 'ui/content-view';
import {TNSOTSession} from "./session";
declare var com: any, android: any;
const StreamListener = com.opentok.android.SubscriberKit.StreamListener;
const SubscriberListener = com.opentok.android.SubscriberKit.SubscriberListener;
const BaseVideoRenderer = com.opentok.android.BaseVideoRenderer;
import * as utils from "utils/utils";
export class TNSOTSubscriber extends ContentView {
    private _android: any;
    private _subscriber: any;
    private _events:Observable;
    _render_style: any;

    constructor(){
        super();
        this._events = new Observable();
    }
    get android() {
        return this._android;
    }

    get _nativeView() {
        return this._android;
    }

    get subscriber() {
        return this._subscriber;
    }

    resetSubscriberView(){
        console.log('resetSubsView from subscriber.....');

        let sub = this._subscriber.getView();
        this._android.removeView(sub);
    }

    _createUI() {
        this._android = new android.widget.LinearLayout(utils.ad.getApplicationContext());
    }

    subscribe(session: any, stream: any) {
        const that = new WeakRef(this);
        this._subscriber = new com.opentok.android.Subscriber(utils.ad.getApplicationContext(), stream);
        this._subscriber.getRenderer().setStyle(com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_SCALE, this.render_style);
        this._subscriber.setSubscriberListener(new com.opentok.android.SubscriberKit.SubscriberListener({
            owner: that.get(),
            onConnected(subscriber){
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'subscriberDidConnectToStream',
                        object: new Observable({
                            subscriber:subscriber
                        })

                    });
                }
            },
            onDisconnected(subscriber){
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'subscriberDidDisconnect',
                        object: new Observable({
                            subscriber:subscriber
                        })
                    });
                }
            },
            onError(subscriber, error){
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'didFailWithError',
                        object: new Observable({
                            subscriber: subscriber,
                            error: error
                        })
                    });
                }
            },
        }));
        this._subscriber.setStreamListener(new com.opentok.android.SubscriberKit.StreamListener({
            owner: that.get(),
            onDisconnected(subscriber){
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'didDisconnectFromStream',
                        object: new Observable({
                            subscriber:subscriber
                        })
                    });
                }
            },
            onReconnected(subscriber){
                if (this.owner._events) {
                    this.owner._events.notify({
                        eventName: 'didReconnectToStream',
                        object: new Observable({
                            subscriber:subscriber
                        })

                    });
                }
            }
        }));
        let sub = this._subscriber.getView();
        this._android.addView(sub);

        if(session instanceof TNSOTSession){
            session.session.subscribe(this._subscriber);
        }else{
            session.subscribe(this._subscriber);
        }

    }

    toggleVideo() {
        let _isEnabled = this._subscriber.getSubscribeToVideo();
        if (_isEnabled) {
            this.setVideoActive(false);
        } else {
            this.setVideoActive(true);
        }
    }

    setVideoActive(state: boolean) {
        this._subscriber.setSubscribeToVideo(state);
    }

    toggleAudio() {
        let _isEnabled = this._subscriber.getSubscribeToAudio();
        if (_isEnabled) {
            this.setAudioActive(false);
        } else {
            this.setAudioActive(true);
        }
    }

    setAudioActive(state: boolean) {
        this._subscriber.setSubscribeToAudio(state);
    }

    get events():Observable{
        return this._events;
    }

    get render_style() {
        return this._render_style;
    }

    set render_style(value: any) {
        switch (value) {
            case 'fit':
                this._render_style = com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_FIT;
                break;
            case 'fill':
                this._render_style = com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_FILL;
                break;
            case 'scale':
                this._render_style = com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_SCALE;
                break;
            default:
                this._render_style = com.opentok.android.BaseVideoRenderer.STYLE_VIDEO_FILL;
                break;
        }
    }

}