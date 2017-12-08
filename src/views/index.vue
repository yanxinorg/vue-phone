<template>
    <div class="nexus">
      <div class="screen">
			<div class="phone-tab-contents">
			<div class="tab phone current">
				<div class="number-area">
				<span v-if=' status === "talk"' class="phone-pic" ></span>
				<span class="numbers" > {{ labelToShow }} </span>
				
				</div>
				<div class="numbers-container">
				<span class="pushed1"  @click="handleNumberButton(1)" >1<!-- <em class="brd">o o</em> --></span>
				<span class="pushed2"  @click="handleNumberButton(2)" >2<!-- <em>ABC</em> --></span>
				<span class="pushed3"  @click="handleNumberButton(3)" >3<!-- <em>DEF</em> --></span>
				<span class="pushed4"  @click="handleNumberButton(4)" >4<!-- <em>GHI</em> --></span>
				<span class="pushed5"  @click="handleNumberButton(5)" >5<!-- <em>JKL</em> --></span>
				<span class="pushed6"  @click="handleNumberButton(6)" >6<!-- <em>MNO</em> --></span>
				<span class="pushed7"  @click="handleNumberButton(7)" >7<!-- <em>PQRS</em> --></span>
				<span class="pushed8"  @click="handleNumberButton(8)" >8<!-- <em>TUV</em>< --></span>
				<span class="pushed9"  @click="handleNumberButton(9)" >9<!-- <em>WXYZ</em> --></span>
				<span class="pushedasterisk fff" @click="handleNumberButton('*')" >*</span>
				<span class="pushed0"  @click="handleNumberButton(0)" >0<!-- <em>+</em> --></span>
				<span class="pushednumber fff" @click="handleNumberButton('#')" >#</span>
				</div>
			</div>
			</div>
			
			<ul class="main-btns">
			<li><a class="btn-people"></a></li>
			<li v-if='status === "call" ||  status === "idle" ||  status === "talk"' ><a v-bind:class="[callButtonClass]"  @click="handleCallButton()" ></a></li>
			<li v-if='status === "reCall" || status === "endTalk" '  class="yes-no">
				<span class="yes" @click="handleYesButton()"  ></span>
				<span class="no" @click="handleNoButton()" ></span>
			</li>
			<li><a class="btn-del delete-btn"  @click="handleBackButton()"   ></a></li>
			</ul>

			<Card style="margin-top:10px;" >
				<audio id="audio_remote" autoplay="autoplay"> </audio>
				<audio id="ringtone" loop src="../assets/ringtone.wav"> </audio>
				<audio id="ringbacktone" loop src="../assets/ringbacktone.wav"> </audio>
				<audio id="dtmfTone" src="../assets/dtmf.wav"> </audio>

				WebSocket Server URL
				<Input v-model="sipParams.ws" placeholder="Enter something..." style="width: 100%"></Input>
				Display Name
				<Input v-model="sipParams.name" placeholder="e.g. John Doe" style="width: 100%"></Input>
				Private Identity
				<Input v-model="sipParams.localId" placeholder="e.g. +33600000000" style="width: 100%"></Input>
				Public Identity
				<Input v-model="sipParams.publicId" placeholder="e.g. sip:+33600000000@doubango.org" style="width: 100%"></Input>
				Password
				<Input v-model="sipParams.passwd" placeholder="123456" style="width: 100%"></Input>
				Realm
				<Input v-model="sipParams.realm" placeholder="192.168.1.10" style="width: 100%"></Input>

				<Button type="primary"  @click="sipLogin" >Login</Button>
			</Card>
      </div>
    </div>

</template>
<script>
import Util from '../libs/util';

export default {
  data () {
      return {
		sipParams: {
			ws: 'ws://192.168.1.236:8088/ws',
			name: '1003',
			localId: '1003',
			publicId: 'sip:1003@192.168.1.236',
			passwd: '1003',
			realm: '192.168.1.236',
		},
        status:'idle',
        phoneNumber:'',
        hintString:'请拨号',
		callButtonClass: 'btn-btn-gray',
		audio: {
			buttonAudio: null,
			ringToneAudio: null,
			ringBackAudio: null
		}
      }
  },
  computed: {
    labelToShow: {
        get: function () {
          return this.hintString + this.phoneNumber;
        },
        set: function () {
          return this.hintString + this.phoneNumber;
        }
    }
  },
  mounted () {
	  Util.preInitSIP();
	  this.audio.buttonAudio = document.getElementById('dtmfTone');
	  this.audio.ringToneAudio = document.getElementById('ringtone');
	  this.audio.ringBackAudio = document.getElementById('ringbacktone');
  },
  beforeDestroy () {

  },
  methods: {
	playRingTone(isStop) {
		if (isStop) {
			this.audio.ringToneAudio.pause();
		} else {
			this.audio.ringToneAudio.play();
		}
	},
	playRingBackTone(isStop) {
		if (isStop) {
			this.audio.ringBackAudio.pause();
		} else {
			this.audio.ringBackAudio.play();
		}
    },
    sipLogin() {
		// console.log('pppppppppppppppppppppppppppppppp');
		Util.preInitSIP();
		Util.sipRegist(this.sipParams);
    },
    handleStart() {
      this.$Modal.info({
        title: "Bravo",
        content: "Now, enjoy the convenience of iView."
      });
    },
    handleNumberButton(number) {
	  this.audio.buttonAudio.play();
      this.hintString = '';
      this.phoneNumber +=  number;
      if (1 === this.phoneNumber.length) {
        this.callButtonClass = 'btn-btn-green';
      }
    },
    handleBackButton() {
	  this.audio.buttonAudio.play();
      var tmpStr = this.phoneNumber;
      this.phoneNumber = tmpStr.substring(0,tmpStr.length-1)
      if (0 === this.phoneNumber.length) {
        this.hintString = '请拨号';
        this.callButtonClass = 'btn-btn-gray';
      }
    },
    handleCallButton() {
		this.audio.buttonAudio.play();
        if ( this.status === 'call' ) { // 如果当前状态是正在呼叫，则提示是否重拨
            this.status = 'reCall';
            console.log('提示是否重拨');
        } else if ( this.status === 'idle' ) { // 如果当前状态是空闲,则拨号
			Util.sipCall('call-audio',this.phoneNumber);
			this.status = 'call';
            this.callButtonClass = 'btn-btn-red';
            console.log('拨号');
        } else if ( this.status === 'talk' ) { // 如果当前状态是通话,则提示是否挂断
            this.status = 'endTalk';
            console.log('提示是否挂断');
        }
        console.log('handleCallButton');
    },
    handleYesButton() {
		this.audio.buttonAudio.play();
		if (this.status === 'reCall') { // 如果当前状态是是否重拨
		  Util.sipCall('call-audio',this.phoneNumber);
          this.status = 'call';
          this.callButtonClass = 'btn-btn-red';
          console.log('重拨');
        } else if ( this.status === 'endTalk' ) { // 如果当前状态是是否挂断
          this.status = 'idle';
          this.callButtonClass = 'btn-btn-gray';
          this.phoneNumber = '';
          console.log('挂断');
        }
    },
    handleNoButton() {
		this.audio.buttonAudio.play();
        if (this.status === 'reCall') { // 如果当前状态是是否重拨
          this.status = 'idle';
          this.callButtonClass = 'btn-btn-gray';
		  this.phoneNumber = '';
		  this.hintString = '请拨号';
          console.log('不重拨，挂断');
        } else if ( this.status === 'endTalk' ) { // 如果当前状态是是否挂断
          console.log('不挂断，啥都不做');
        }
        console.log('handleNoButton');
    }
  }
};
</script>

<style scoped lang="less">
::selection {
  background: transparent;
}

.nexus {
  position: relative;
  margin: 100px auto;
  width: 500px;
}

.nexus:before {
  position: absolute;
  content: "";
  z-index: -1;
  top: -6px;

  background: #eaeae8;
  width: 211px;
  height: 25px;
  border-radius: 20px 20px 0 0;
}

.screen {
  position: absolute;
  top: 19px;
  width: 211px;
  background: white;
}
.phone-infos {
  width: 100%;
  height: 19px;
  background: #0d6fb8;
}
/* .phone-infos span{
	float:right;
	font-size:11px;
	margin:2px 3px;
} */
.phone-infos button {
  width: 14px;
  height: 16px;
  border: 0;
  background: url(../images/ph_r4_c6.png) 0 0 no-repeat;
  font-size: 0;
  margin: 2px 0 0 101px;
  cursor: pointer;
}

.phone-infos .battery {
  width: 8px;
  height: 10px;
  background: #4196b7;
  margin-top: 2px;
  position: relative;
  margin-top: 4px;
}
.phone-infos .battery:before {
  width: 4px;
  height: 2px;
  position: absolute;
  left: 2px;
  top: -2px;
  background: #4196b7;
  content: "";
}
.phone-infos .gsm {
  position: relative;
  height: 12px;
  margin-right: 10px;
}
.phone-infos .gsm b {
  float: left;
  position: absolute;
  bottom: 0;
}
.phone-infos .gsm b:before {
  position: absolute;
  content: "";
  top: -3px;
  width: 0;
  height: 0;
  border-bottom: 3px solid #4196b7;
  border-left: 3px solid transparent;
}
.phone-infos .gsm .signal1 {
  width: 3px;
  height: 0px;
  background: #4196b7;
  left: -8px;
}
.phone-infos .gsm .signal2 {
  width: 3px;
  height: 3px;
  background: #4196b7;
  left: -4px;
}
.phone-infos .gsm .signal3 {
  width: 3px;
  height: 7px;
  background: #4196b7;
}
.phone-infos .gsm .signal4 {
  width: 3px;
  height: 11px;
  background: #808184;
  left: 4px;
}
.phone-infos .gsm .signal4:before {
  border-bottom: 3px solid #808184;
  border-left: 3px solid transparent;
}

.phone-tabs {
  border-bottom: 1px solid #858383;
  background: #303030;
  height: 50px;
}
.phone-tabs li {
  float: left;
  list-style: none;
  -webkit-transition: all 0.05s ease-in;
  -moz-transition: all 0.05s ease-in;
  -o-transition: all 0.05s ease-in;
  transition: all 0.05s ease-in;
}
.phone-tabs li a {
  -webkit-transition: all 0.05s ease-in;
  -moz-transition: all 0.05s ease-in;
  -o-transition: all 0.05s ease-in;
  transition: all 0.05s ease-in;
  text-decoration: none;
  background: #303030;
  cursor: pointer;
  height: 40px;
  width: 94px;
  display: block;
  text-align: center;
  position: relative;
  padding-top: 10px;
}
.phone-tabs li a:active {
  background: rgba(104, 208, 249, 0.4);
}
.phone-tabs li a:before {
  height: 20px;
  width: 1px;
  background: #858383;
  position: absolute;
  content: "";
  left: 0;
  top: 16px;
}
.phone-tabs li:first-child a:before {
  display: none;
}
.phone-tabs li.current a:after {
  position: absolute;
  content: "";
  left: 0px;
  bottom: 0px;
  width: 100%;
  height: 5px;
  background: #4196b7;
}

.phone-tab-contents {
  width: 100%;
  height: 256px;
  position: relative;
  overflow: hidden;
}
.phone-tab-contents .tab {
  width: 100%;
  /* height:365px; */
  position: absolute;
  background: #eaeae8;
  position: absolute;
  -webkit-transition: all 0.25s ease-in;
  -moz-transition: all 0.25s ease-in;
  -o-transition: all 0.25s ease-in;
  transition: all 0.25s ease-in;
}
.phone-tab-contents .tab.phone {
  left: 0;
  background: #3f3f3f
    url(data:image/png; base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAKElEQVQIW2NkQAOO07anMSKLgQT2Z3nOggvCBECKwILIAmBBdAGQIABJuxH63EphJgAAAABJRU5ErkJggg==)
    repeat;
}
.phone-tab-contents .tab.clock {
  left: 282px;
}
.phone-tab-contents .tab.peoples {
  left: 564px;
}
.phone-tab-contents.getclock .tab.phone {
  left: -282px;
}
.phone-tab-contents.getclock .tab.clock {
  left: 0px;
}
.phone-tab-contents.getclock .tab.peoples {
  left: 282px;
}
.phone-tab-contents.getpeoples .tab.phone {
  left: -564px;
}
.phone-tab-contents.getpeoples .tab.clock {
  left: -282px;
}
.phone-tab-contents.getpeoples .tab.peoples {
  left: 0px;
}
.phone-tab-contents .tab.clock p:first-child,
.phone-tab-contents .tab.peoples p:first-child {
  margin-top: 50px;
}
.phone-tab-contents .tab.peoples p,
.phone-tab-contents .tab.clock p {
  width: 90%;
  padding: 10px 5% 0;
  text-align: center;
  color: #bbb;
}
.phone-tab-contents .tab.peoples p a,
.phone-tab-contents .tab.clock p a {
  color: #fff;
}
.main-btns {
  width: 100%;
  height: 43px;
  background-color: #eaeae8;
  border-radius: 0 0 20px 20px;
  position: relative;
}
.main-btns li {
  list-style: none;
  float: left;
  margin-top: 2px;
}
.main-btns li a {
  width: 30px;
  display: block;
  width: 94px;
  height: 34px;
  text-align: center;
}
.main-btns .btn-people {
  background: url(../images/ph_r3_c1.png) 0 0 no-repeat;
  margin-left: 9px;
  width: 34px;
  height: 30px;
  cursor: pointer;
}
.main-btns {
  .btn-btn-green {
    background: url(../images/ph_r3_c3.png) 0 -105px no-repeat;
    width: 116px;
    height: 30px;
    cursor: pointer;
    margin: 0 5px;
  }
  .btn-btn-red {
    background: url(../images/ph_r3_c3.png) 0 -49px no-repeat;
    width: 116px;
    height: 30px;
    cursor: pointer;
    margin: 0 5px;
  }
  .btn-btn-gray {
    background: url(../images/ph_r3_c3.png) 0 0 no-repeat;
    width: 116px;
    height: 30px;
    cursor: pointer;
    margin: 0 5px;
  }
}
.main-btns .btn-del {
  background: url(../images/ph_r3_c4.png) 0 0 no-repeat;
  width: 34px;
  height: 30px;
  cursor: pointer;
}
.number-area {
  color: #fff;
  font-size: 20px;
  text-align: center;
  padding: 0px 0;
  width: 100%;
  height: 54px;
  overflow: hidden;
  background-color: #1e1b1c;
  margin-bottom: 10px;
}
.number-area .numbers {
  // overflow: hidden;
  white-space: scroll;
  width: 10px;
  padding: 0 5px;
  /* background-color: pink; */
  margin: 0 3px;
  font-size: 20px;
  line-height: 54px;
  padding: 0 10px;
  height: 54px;
}
.speaker .numbers {
  padding: 0 10px;
  float: right;
  width: 8em;
  overflow: hidden;
  white-space: nowrap; /* 强制不换行 */
  height: 18px;
  margin-right: 10px;
  display: inline;
  color: #939192;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  line-height: 20px;
}
.speaker .bo,
.speaker .tong {
  position: absolute;
  left: 26px;
  color: #231815;
  font-size: 12px;
  font-family: "Microsoft yahei";
}
.circle {
  width: 12px;
  height: 8px;
  float: left;
  margin: 4px 0 0 10px;
  display: inline;
  background: url(../images/ph_r4_c12.png) 0 -22px no-repeat;
}
.number-area .delete-btn {
  float: right;
  margin-right: 10px;
  margin-top: 30px;
  cursor: pointer;
}
.numbers-container {
  overflow: hidden;
  margin: 5px auto;
}
.phone .cover {
  position: absolute;
  top: 75px;
  left: 0;
  z-index: 99;
  width: 211px;
  height: 200px;
  background: rgba(255, 255, 255, 0.7);
}
.numbers-container span {
  width: 40px;
  height: 40px;
  float: left;
  font-size: 0;
  margin: 0 30px 8px 0;
  border-radius: 25%;
  position: relative;
  cursor: pointer;
  background: url(../images/ph_r10_c18.png) 0 0 no-repeat;
}
.numbers-container .pushed1 {
  background-position: 8px 4px;
  margin-left: 16px;
}
.numbers-container .pushed2 {
  background-position: -53px 2px;
}
.numbers-container .pushed3 {
  background-position: -116px 2px;
  margin-right: 0;
}
.numbers-container .pushed4 {
  margin-left: 16px;
  background-position: 8px -44px;
}
.numbers-container .pushed5 {
  background-position: -53px -44px;
}
.numbers-container .pushed6 {
  background-position: -116px -44px;
  margin-right: 0;
}
.numbers-container .pushed7 {
  margin-left: 16px;
  background-position: 8px -90px;
}
.numbers-container .pushed8 {
  background-position: -53px -89px;
}
.numbers-container .pushed9 {
  background-position: -116px -90px;
  margin-right: 0;
}
.numbers-container .pushedasterisk {
  margin-left: 16px;
  background-position: 8px -127px;
}
.numbers-container .pushed0 {
  background-position: -53px -127px;
}
.numbers-container .pushednumber {
  background-position: -116px -127px;
  margin-right: 0;
}
.numbers-container span:active {
  background-color: #dddddb;
}
.numbers-container span em {
  font-size: 12px;
  color: #fff;
  font-style: normal;
  position: absolute;
  left: 22px;
  bottom: 15px;
  padding-bottom: 5px;
}
.numbers-container span em.brd:before {
  position: absolute;
  width: 14px;
  height: 2px;
  background: #fff;
  content: "";
  top: 9px;
  left: 24px;
}
.numbers-container span em:after {
  width: 35px;
  height: 2px;
  background: #4196b7;
  content: "";
  position: absolute;
  top: 16px;
  left: 22px;
}
.numbers-container span.fff {
  color: #fff;
  text-align: center;
}
.call-btn {
  width: 100%;
  text-align: center;
  /* border-top:1px solid #333; */
  padding-top: 10px;
  background-color: pink;
}
/* 	Icon Group 	*/
.icon {
  display: inline-block;
  font-style: normal;
  position: relative;
}
.icon.phone {
  background: #fff;
  width: 5px;
  height: 26px;
  -webkit-transform: rotate(145deg);
  -moz-transform: rotate(145deg);
  -o-transform: rotate(145deg);
  transform: rotate(145deg);
  border-radius: 0 6px 6px 0;
  margin-top: 5px;
}
.icon.phone:before {
  position: absolute;
  content: "";
  width: 8px;
  height: 9px;
  background: #fff;
  left: -6px;
  bottom: -1px;
  border-radius: 3px 6px 7px 3px;
}
.icon.phone:after {
  position: absolute;
  content: "";
  width: 8px;
  height: 9px;
  background: #fff;
  left: -6px;
  top: -1px;
  border-radius: 3px 6px 7px 3px;
}
.icon.clock {
  background: #303030;
  width: 22px;
  height: 22px;
  border: 2px solid #fff;
  border-radius: 22px;
  margin-top: 4px;
}
.icon.clock:before {
  position: absolute;
  content: "";
  height: 9px;
  width: 2px;
  background: #fff;
  top: 2px;
  left: 10px;
}
.icon.clock:after {
  position: absolute;
  content: "";
  height: 9px;
  width: 2px;
  background: #fff;
  top: 9px;
  -webkit-transform: rotate(120deg);
  -o-transform: rotate(120deg);
  -moz-transform: rotate(120deg);
  transform: rotate(120deg);
  left: 14px;
}
.icon.peoples {
  background: #fff;
  height: 10px;
  width: 22px;
  border-radius: 12px 12px 0 0;
  margin-top: 20px;
}
.icon.peoples:after {
  position: absolute;
  content: "";
  background: #fff;
  width: 14px;
  height: 14px;
  border: 2px solid #303030;
  border-radius: 18px;
  top: -14px;
  left: 2px;
  z-index: 10;
}
.icon.peoples:before {
  position: absolute;
  content: "";
  background: #303030;
  width: 10px;
  height: 5px;
  left: 6px;
  top: -5px;
  z-index: 20;
  border-radius: 0 0 15px 15px;
}
.icon.close {
  font-size: 12px;
  color: #303030;
  background: #fff;
  width: 14px;
  height: 12px;
  line-height: 12px;
  margin-top: 5px;
}
.icon.close:before {
  position: absolute;
  content: "";
  left: -8px;
  width: 0px;
  height: 0px;
  border-style: solid;
  border-width: 6.5px 8px 6.5px 0;
  border-color: transparent #ffffff transparent transparent;
}
.icon.home {
  width: 25px;
  height: 8px;
  border: 2px solid #bbbbbb;
  border-top: 0;
  margin-top: 15px;
}
.icon.home:after {
  width: 2px;
  height: 17px;
  background: #bbbbbb;
  position: absolute;
  top: -12px;
  left: 5px;
  content: "";
  -webkit-transform: rotate(70deg);
  -moz-transform: rotate(70deg);
  -o-transform: rotate(70deg);
  transform: rotate(70deg);
}
.icon.home:before {
  width: 2px;
  height: 17px;
  background: #bbbbbb;
  position: absolute;
  top: -12px;
  right: 5px;
  content: "";
  -webkit-transform: rotate(110deg);
  -moz-transform: rotate(110deg);
  -o-transform: rotate(110deg);
  transform: rotate(110deg);
}
.icon.windows {
  width: 20px;
  height: 8px;
  border: 2px solid #bbbbbb;
  margin-top: 13px;
}
.icon.windows:after {
  width: 2px;
  height: 14px;
  background: #bbbbbb;
  position: absolute;
  content: "";
  right: -6px;
  top: -6px;
}
.icon.windows:before {
  width: 22px;
  height: 2px;
  background: #bbbbbb;
  position: absolute;
  content: "";
  right: -4px;
  top: -6px;
}
.icon.back {
  width: 20px;
  height: 2px;
  background: #bbb;
  color: #bbb;
  font-size: 18px;
  line-height: 0px;
  text-indent: -16px;
  font-family: sans-serif;
  margin-top: 12px;
}
.icon.back:before {
  width: 7px;
  height: 11px;
  background: #303030;
  position: absolute;
  content: "";
  left: 8px;
  z-index: 10;
  top: 2px;
}
.icon.back:after {
  width: 20px;
  height: 7px;
  border: 2px solid #bbb;
  position: absolute;
  content: "";
  border-radius: 10px;
}
.phone-pic {
  width: 40px;
  height: 40px;
  background: url(../images/ph_r1_c8.png) center no-repeat;
  float: left;
  position: absolute;
  top: 18px;
  left: 50%;
  margin-left: -20px;
}
.re-phone {
  font-size: 18px;
  font-family: "Microsoft yahei";
  font-weight: 600;
  position: absolute;
  top: 24px;
  left: 50%;
  width: 78px;
  margin-left: -39px;
}
.over-phone {
  font-size: 18px;
  font-family: "Microsoft yahei";
  font-weight: 600;
  position: absolute;
  top: 24px;
  left: 50%;
  width: 78px;
  margin-left: -39px;
}
.yes,
.no {
  float: left;
  border-radius: 7px;
  margin-right: 5px;
  width: 57px;
  height: 28px;
  background-color: red;
  text-align: center;
  background: url(../images/ph_r3_c3.png) 0 -152px no-repeat;
  cursor: pointer;
}
.no {
  background-color: #fff;
  background-position: -59px -152px;
  margin-right: 3px;
}
.yes-no {
  float: left;
  margin-left: 4px;
}
</style>
