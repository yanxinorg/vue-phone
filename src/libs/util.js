import SIPml from './SIPml-api';

var getPVal = function (PName) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === PName) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
};

var oSipStack = null;
var oSipSessionRegister = null;
var oSipSessionCall = null;
var oSipSessionTransferCall = null;
var oConfigCall = null;

let util = {};

// Callback function for SIP sessions (INVITE, REGISTER, MESSAGE...)
var onSipEventSession = function (e /* SIPml.Session.Event */ ) {
    tsk_utils_log_info('==session event = ' + e.type);

    switch (e.type) {
        case 'connecting':
        case 'connected':
            {
                var bConnected = (e.type == 'connected');
                if (e.session == oSipSessionRegister) {

                } else if (e.session == oSipSessionCall) {
                    if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback

                    }
                }
                break;
            } // 'connecting' | 'connected'
        case 'terminating':
        case 'terminated':
            {
                if (e.session == oSipSessionRegister) {
                    oSipSessionCall = null;
                    oSipSessionRegister = null;

                } else if (e.session == oSipSessionCall) {

                }
                break;
            } // 'terminating' | 'terminated'

        case 'm_stream_video_local_added':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_stream_video_local_removed':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_stream_video_remote_added':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_stream_video_remote_removed':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }

        case 'm_stream_audio_local_added':
        case 'm_stream_audio_local_removed':
        case 'm_stream_audio_remote_added':
        case 'm_stream_audio_remote_removed':
            {
                break;
            }

        case 'i_ect_new_call':
            {
                oSipSessionTransferCall = e.session;
                break;
            }

        case 'i_ao_request':
            {
                if (e.session == oSipSessionCall) {
                    var iSipResponseCode = e.getSipResponseCode();
                    if (iSipResponseCode == 180 || iSipResponseCode == 183) {

                    }
                }
                break;
            }

        case 'm_early_media':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }

        case 'm_local_hold_ok':
            {
                if (e.session == oSipSessionCall) {
                    if (oSipSessionCall.bTransfering) {
                        oSipSessionCall.bTransfering = false;
                        // this.AVSession.TransferCall(this.transferUri);
                    }
                    btnHoldResume.value = 'Resume';
                    btnHoldResume.disabled = false;
                    txtCallStatus.innerHTML = '<i>Call placed on hold</i>';
                    oSipSessionCall.bHeld = true;
                }
                break;
            }
        case 'm_local_hold_nok':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_local_resume_ok':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_local_resume_nok':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_remote_hold':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_remote_resume':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'm_bfcp_info':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }

        case 'o_ect_trying':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'o_ect_accepted':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'o_ect_completed':
        case 'i_ect_completed':
            {
                if (e.session == oSipSessionCall) {

                    if (oSipSessionTransferCall) {
                        oSipSessionCall = oSipSessionTransferCall;
                    }
                    oSipSessionTransferCall = null;
                }
                break;
            }
        case 'o_ect_failed':
        case 'i_ect_failed':
            {
                if (e.session == oSipSessionCall) {

                }
                break;
            }
        case 'o_ect_notify':
        case 'i_ect_notify':
            {
                if (e.session == oSipSessionCall) {

                    if (e.getSipResponseCode() >= 300) {
                        if (oSipSessionCall.bHeld) {
                            oSipSessionCall.resume();
                        }

                    }
                }
                break;
            }
        case 'i_ect_requested':
            {
                if (e.session == oSipSessionCall) {

                    if (confirm(s_message)) {
                        oSipSessionCall.acceptTransfer();
                        break;
                    }
                    oSipSessionCall.rejectTransfer();
                }
                break;
            }
    }
};

// Callback function for SIP Stacks
var onSipEventStack = function (e /*SIPml.Stack.Event*/ ) {
    tsk_utils_log_info('==stack event = ' + e.type);
    switch (e.type) {
        case 'started':
            {
                // catch exception for IE (DOM not ready)
                try {
                    // LogIn (REGISTER) as soon as the stack finish starting
                    oSipSessionRegister = this.newSession('register', {
                        expires: 200,
                        events_listener: {
                            events: '*',
                            listener: onSipEventSession
                        },
                        sip_caps: [{
                                name: '+g.oma.sip-im',
                                value: null
                            },
                            //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                            {
                                name: '+audio',
                                value: null
                            },
                            {
                                name: 'language',
                                value: '\"en,fr\"'
                            }
                        ]
                    });
                    oSipSessionRegister.register();
                } catch (e) {

                }
                break;
            }
        case 'stopping':
        case 'stopped':
        case 'failed_to_start':
        case 'failed_to_stop':
            {
                var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
                oSipStack = null;
                oSipSessionRegister = null;
                oSipSessionCall = null;
                break;
            }

        case 'i_new_call':
            {
                if (oSipSessionCall) {
                    // do not accept the incoming call if we're already 'in call'
                    e.newSession.hangup(); // comment this line for multi-line support
                } else {
                    oSipSessionCall = e.newSession;
                    // start listening for events
                    oSipSessionCall.setConfiguration(oConfigCall);

                    var sRemoteNumber = (oSipSessionCall.getRemoteFriendlyName() || 'unknown');

                }
                break;
            }

        case 'm_permission_requested':
            {

                break;
            }
        case 'm_permission_accepted':
        case 'm_permission_refused':
            {

                if (e.type == 'm_permission_refused') {

                }
                break;
            }

        case 'starting':
        default:
            break;
    }
};

util.title = function (title) {
    title = title ? title + ' - Home' : 'iView project';
    window.document.title = title;
};

util.preInitSIP = function () {
    // set default webrtc type (before initialization)
    var s_webrtc_type = getPVal("wt");
    var s_fps = getPVal("fps");
    var s_mvs = getPVal("mvs"); // maxVideoSize
    var s_mbwu = getPVal("mbwu"); // maxBandwidthUp (kbps)
    var s_mbwd = getPVal("mbwd"); // maxBandwidthUp (kbps)
    var s_za = getPVal("za"); // ZeroArtifacts
    var s_ndb = getPVal("ndb"); // NativeDebug

    if (s_webrtc_type) SIPml.setWebRtcType(s_webrtc_type);

    // initialize SIPML5
    SIPml.init(util.postInitSIP);

    // set other options after initialization
    if (s_fps) SIPml.setFps(parseFloat(s_fps));
    if (s_mvs) SIPml.setMaxVideoSize(s_mvs);
    if (s_mbwu) SIPml.setMaxBandwidthUp(parseFloat(s_mbwu));
    if (s_mbwd) SIPml.setMaxBandwidthDown(parseFloat(s_mbwd));
    if (s_za) SIPml.setZeroArtifacts(s_za === "true");
    if (s_ndb == "true") SIPml.startNativeDebug();

    //var rinningApps = SIPml.getRunningApps();
    //var _rinningApps = Base64.decode(rinningApps);
    //tsk_utils_log_info(_rinningApps);
};

util.postInitSIP = function () {

    var audioRemote = document.getElementById("audio_remote");

    // check for WebRTC support
    if (!SIPml.isWebRtcSupported()) {
        // is it chrome?
        if (SIPml.getNavigatorFriendlyName() == 'chrome') {
            if (confirm("You're using an old Chrome version or WebRTC is not enabled.\nDo you want to see how to enable WebRTC?")) {
                window.location = 'http://www.webrtc.org/running-the-demos';
            } else {
                window.location = "index.html";
            }
            return;
        } else {
            if (confirm("webrtc-everywhere extension is not installed. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {
                window.location = 'https://github.com/sarandogou/webrtc-everywhere';
            } else {
                // Must do nothing: give the user the chance to accept the extension
                // window.location = "index.html";
            }
        }
    }

    // checks for WebSocket support
    if (!SIPml.isWebSocketSupported()) {
        if (confirm('Your browser don\'t support WebSockets.\nDo you want to download a WebSocket-capable browser?')) {
            window.location = 'https://www.google.com/intl/en/chrome/browser/';
        } else {
            window.location = "index.html";
        }
        return;
    }

    // FIXME: displays must be per session
    // viewVideoLocal = videoLocal;
    // viewVideoRemote = videoRemote;

    if (!SIPml.isWebRtcSupported()) {
        if (confirm('Your browser don\'t support WebRTC.\naudio/video calls will be disabled.\nDo you want to download a WebRTC-capable browser?')) {
            window.location = 'https://www.google.com/intl/en/chrome/browser/';
        }
    }
    document.body.style.cursor = 'default';
    oConfigCall = {
        audio_remote: audioRemote,
        screencast_window_id: 0x00000000, // entire desktop
        bandwidth: {
            audio: undefined,
            video: undefined
        },
        video_size: {
            minWidth: undefined,
            minHeight: undefined,
            maxWidth: undefined,
            maxHeight: undefined
        },
        events_listener: {
            events: '*',
            listener: onSipEventSession
        },
        sip_caps: [{
                name: '+g.oma.sip-im'
            },
            {
                name: 'language',
                value: '\"en,fr\"'
            }
        ]
    };
};

util.sipRegist = function (loginInfo) {
    // catch exception for IE (DOM not ready)
    try {
        // update debug level to be sure new values will be used if the user haven't updated the page
        SIPml.setDebugLevel((window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_debug') == "true") ? "error" : "info");

        // create SIP stack
        oSipStack = new SIPml.Stack({
            realm: loginInfo.realm,
            impi: loginInfo.localId,
            impu: loginInfo.publicId,
            password: loginInfo.passwd,
            display_name: loginInfo.name,
            websocket_proxy_url: loginInfo.ws,
            outbound_proxy_url: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.sip_outboundproxy_url') : null),
            ice_servers: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.ice_servers') : null),
            enable_rtcweb_breaker: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_rtcweb_breaker') == "true" : false),
            events_listener: {
                events: '*',
                listener: onSipEventStack
            },
            enable_early_ims: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.disable_early_ims') != "true" : true), // Must be true unless you're using a real IMS network
            enable_media_stream_cache: (window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_media_caching') == "true" : false),
            bandwidth: (window.localStorage ? tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')) : null), // could be redefined a session-level
            video_size: (window.localStorage ? tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')) : null), // could be redefined a session-level
            sip_headers: [{
                    name: 'User-Agent',
                    value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04'
                },
                {
                    name: 'Organization',
                    value: 'Doubango Telecom'
                }
            ]
        });

        if (oSipStack.start() != 0) {
            console.log('VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
        } else {
            console.log('ooooooooooooooooooooooooooooooooooooooooooooooooooooo');
        };

    } catch (e) {
        console.log(e);
        console.log('NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN');
    }
};

// s_type "call-audio"  "call-audiovideo" 'call-screenshare'
util.sipCall = function (s_type,phoneNumber) {
    if (oSipStack && !oSipSessionCall && !tsk_string_is_null_or_empty(phoneNumber)) {
        if (s_type == 'call-screenshare') {
            if (!SIPml.isScreenShareSupported()) {
                alert('Screen sharing not supported. Are you using chrome 26+?');
                return;
            }
            if (!location.protocol.match('https')) {
                if (confirm("Screen sharing requires https://. Do you want to be redirected?")) {
                    sipUnRegister();
                    window.location = 'https://ns313841.ovh.net/call.htm';
                }
                return;
            }
        }

        if (window.localStorage) {
            oConfigCall.bandwidth = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')); // already defined at stack-level but redifined to use latest values
            oConfigCall.video_size = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')); // already defined at stack-level but redifined to use latest values
        }

        // create call session
        oSipSessionCall = oSipStack.newSession(s_type, oConfigCall);
        // make call
        if (oSipSessionCall.call(phoneNumber) != 0) {
            oSipSessionCall = null;
            return;
        }
    } else if (oSipSessionCall) {
        oSipSessionCall.accept(oConfigCall);
    }
};

util.sipHangUp = function () {

};

util.sipSendDTMF = function () {

};

export default util;