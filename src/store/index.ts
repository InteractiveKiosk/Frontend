import Vue from "vue";
import Vuex from "vuex";

import CryptoJS from "crypto-js";
import axios from "axios";
import { StockItem } from "@/schema";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		audio: new Audio() as HTMLAudioElement,
		stockList: [
			{
				name: "사과",
				alias: ["사과", "사가"],
				price: 1000,
				quantity: 10,
				image: "apple.jpg",
			},
			{
				name: "라면",
				alias: ["라면", "라멘", "나면"],
				price: 500,
				quantity: 10,
				image: "ramen.jpg",
			},
			{
				name: "파스타",
				alias: ["파스타", "스파게티", "스파게리", "수파게티", "파수타"],
				price: 10000,
				quantity: 10,
				image: "pasta.jpg",
			},
			{
				name: "복숭아",
				alias: ["복숭아", "봉숭아", "보숭아", "보숭이", "복숭", "보숭"],
				price: 2000,
				quantity: 10,
				image: "peach.jpg",
			},
			{
				name: "우유",
				alias: ["우유", "우우", "유유", "으유"],
				price: 3500,
				quantity: 10,
				image: "milk.jpg",
			},
		] as StockItem[],
	},
	mutations: {},
	actions: {
		playAudio({ state }, data: { isLocal: boolean; url: string }): Promise<boolean> {
			let audio = state.audio;
			audio.pause();

			let url: string = data.isLocal ? `/assets/sound/${data.url}.mp3` : data.url;
			audio = new Audio(url);

			audio.play();

			return new Promise<boolean>((resolve) => {
				audio.addEventListener("ended", () => {
					URL.revokeObjectURL(url);
					setTimeout(() => resolve(true), 400);
				});
			});
		},
		async STT({}, data: Blob): Promise<string> {
			return (
				await axios.post("https://naveropenapi.apigw.ntruss.com/recog/v1/stt", data, {
					params: {
						lang: "Kor",
					},
					headers: {
						"Content-Type": "application/octet-stream",
						"X-NCP-APIGW-API-KEY-ID": process.env.VUE_APP_KEYID,
						"X-NCP-APIGW-API-KEY": process.env.VUE_APP_KEY,
					},
					withCredentials: true,
				})
			).data.text;
		},
		async TTS({}, text: string): Promise<any> {
			try {
				let checksum = CryptoJS.MD5(`3134${text}${process.env.VUE_APP_TTSACCOUNT}${process.env.VUE_APP_TTSID}${process.env.VUE_APP_TTSSECRET}`).toString();

				let result: Blob = (
					await axios.get(`http://www.vocalware.com/tts/gen.php?EID=3&LID=13&VID=4&TXT=${text}&ACC=${process.env.VUE_APP_TTSACCOUNT}&API=${process.env.VUE_APP_TTSID}&CS=${checksum}`, {
						responseType: "blob",
						headers: {
							"Content-Type": "audio/mp3",
						},
					})
				).data;

				let url = URL.createObjectURL(result);
				return await this.dispatch("playAudio", { isLocal: false, url });
			} catch (err) {
				console.error(err);
			}
		},
	},
	modules: {},
});
