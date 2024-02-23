<template>
  <q-page class="relative-position">
    <q-scroll-area class="absolute full-width full-height">
      <div class="q-py-lg q-px-md row items-end q-col-gutter-md">
        <div class="col">
          <q-input
            bottom-slots
            v-model="newQweetContent"
            label="What's happening?"
            counter
            maxlength="280"
            autogrow
            class="new-qweet"
          >
            <template v-slot:before>
              <q-avatar size="lg">
                <img src="https://cdn.quasar.dev/img/avatar4.jpg" />
              </q-avatar>
            </template>
          </q-input>
          <q-btn
            color="grey"
            size="sm"
            icon="fa-solid fa-bell"
            flat
            round
            @click="registerNotifications"
          ></q-btn>
          <q-btn
            color="grey"
            size="sm"
            icon="fa-solid fa-camera"
            flat
            round
            @click="captureImage"
          ></q-btn>
          <q-btn
            color="grey"
            size="sm"
            icon="fa-solid fa-mobile"
            flat
            round
            @click="getDeviceInfoLocal"
          ></q-btn>
        </div>
        <div class="col col-shrink">
          <q-btn
            color="primary"
            label="Qweet"
            rounded
            unelevated
            no-caps
            :disable="!newQweetContent"
            class="q-mb-lg"
            @click="addNewQweet"
          />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <q-img :src="imageUrl" :ratio="16 / 9" />
        </div>
      </div>

      <q-separator size="10px" color="grey-2" class="divider" />

      <q-list separator>
        <transition-group
          appear
          enter-active-class="animated fadeIn slow"
          leave-active-class="animated fadeOut slow"
        >
          <q-item
            v-for="qweet in qweets"
            :key="qweet.id"
            class="q-py-md q-pb-sm"
            clickable
            :ripple="{ color: 'primary' }"
          >
            <q-item-section avatar top>
              <q-avatar>
                <img src="https://cdn.quasar.dev/img/avatar4.jpg" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-subtitle2"
                ><strong>Prasetyo Adhi</strong>
                <span class="text-grey-7">
                  @prasetyoadhi
                  <br class="lt-md" />
                  &bull;
                  {{ getRelativeDate(qweet.date) }}
                </span>
              </q-item-label>
              <q-item-label class="qweet-content text-body3">
                {{ qweet.content }}
              </q-item-label>
              <div class="qweet-icons row justify-between q-mt-sm">
                <q-btn
                  color="grey"
                  size="sm"
                  icon="far fa-comment"
                  flat
                  round
                ></q-btn>
                <q-btn
                  color="grey"
                  size="sm"
                  icon="fas fa-retweet"
                  flat
                  round
                ></q-btn>
                <q-btn
                  size="sm"
                  :color="qweet.liked ? 'pink' : 'grey'"
                  :icon="qweet.liked ? 'fas fa-heart' : 'far fa-heart'"
                  flat
                  round
                  @click="toggleLiked(qweet)"
                ></q-btn>
                <q-btn
                  color="grey"
                  size="sm"
                  icon="fas fa-trash"
                  flat
                  round
                  @click="deleteQweet(qweet)"
                ></q-btn>
              </div>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { formatDistance } from "date-fns";
import db from "src/boot/firebase";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { PushNotifications } from "@capacitor/push-notifications";
import { Camera, CameraResultType } from "@capacitor/camera";
import { createWorker } from "tesseract.js";
import { Ocr } from "@capacitor-community/image-to-text";
import { Device } from "@capacitor/device";
import { LocalStorage, SessionStorage } from "quasar";
import { v4 as uuidv4 } from "uuid";

export default defineComponent({
  name: "PageHome",
  data() {
    return {
      email: "adhiprst@gmail.com",
      deviceId: "",
      newQweetContent: "",
      qweets: [
        // {
        //   id: "ID1",
        //   content:
        //     "Life is change. Growth is optional. Choose wisely.\n\nKaren Clark, type.fit",
        //   date: 1706770598526,
        //   liked: true,
        // },
      ],
      unsubscribe: null,
      unsubscribeTokens: null,
      pushToken: "",
      notifications: [],
      imageUrl: "https://picsum.photos/500/300",
      image: null,
    };
  },
  created() {
    try {
      console.log("creating pagehome");
      // console.log(this.$q.platform);
      // LocalStorage.remove("device");

      let device = LocalStorage.getItem("device");
      console.log("Device : " + JSON.stringify(device));

      if (device == undefined || device == null || device == {}) {
        device = this.setDeviceInfo();
        console.log("Device : " + JSON.stringify(device));
      }
    } catch (e) {}
  },
  mounted() {
    const q = query(collection(db, "qweets"), orderBy("date"));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let qweetChange = change.doc.data();
        qweetChange.id = change.doc.id;
        if (change.type === "added") {
          // console.log("New qweet: ", qweetChange);
          qweetChange.content = qweetChange.content.replace(/\\n/g, "\n");
          this.qweets.unshift(qweetChange);
        }
        if (change.type === "modified") {
          console.log("Modified qweet: ", qweetChange);
          let index = this.qweets.findIndex(
            (qweet) => qweet.id == qweetChange.id
          );

          Object.assign(this.qweets[index], qweetChange);
        }
        if (change.type === "removed") {
          console.log("Removed qweet: ", qweetChange);
          let index = this.qweets.findIndex(
            (qweet) => qweet.id == qweetChange.id
          );
          this.qweets.splice(index, 1);
        }
      });
    });

    // push notif
    if (this.$q.platform.is.chrome) return;
    this.addListeners();
  },
  unmounted() {
    console.log("unmounted");
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async setDeviceInfo() {
      // LocalStorage.remove("device");

      let device = {};
      if (this.$q.platform.is.chrome) {
        let uniqueId = uuidv4();
        device.id = uniqueId;
        device.infoWeb = navigator.userAgent;
      } else {
        let deviceId = await Device.getId();
        let deviceInfo = await Device.getInfo();
        device.id = deviceId.identifier;
        device.info = deviceInfo;
      }

      LocalStorage.set("device", device);

      // console.log(JSON.stringify(device));
      return device;
    },
    async getDeviceInfoLocal() {
      // await this.setDeviceInfo();

      let device = LocalStorage.getItem("device");
      this.newQweetContent = "";
      this.newQweetContent += device.id;

      console.log("Device info : " + JSON.stringify(device));
    },
    async addListeners() {
      // Listener untuk mendapatkan token registrasi
      await PushNotifications.addListener("registration", async (token) => {
        console.info("Registration token: ", token.value);

        let newToken = {
          email: this.email,
          token: token.value,
          date: Date.now(),
        };

        const docRef = await addDoc(collection(db, "tokens"), newToken);
        console.log("Document written with ID: ", docRef.id);

        this.pushToken = token.value;
      });

      // Listener untuk menangani kesalahan registrasi
      await PushNotifications.addListener("registrationError", (err) => {
        console.error("Registration error: ", err.error);
      });

      // Listener untuk menangani notifikasi yang diterima
      await PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          console.log("Push notification received: ", notification);
          this.notifications.push(notification);
        }
      );

      // Listener untuk menangani tindakan yang dilakukan pada notifikasi
      await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          console.log(
            "Push notification action performed",
            JSON.stringify(notification)
          );

          if (this.notifications.length > 0) {
            // Memanggil fungsi untuk menambahkan qweet

            this.newQweetContent =
              this.notifications[this.notifications.length - 1].body;

            this.addNewQweet();
          }
        }
      );
    },
    async registerNotifications() {
      console.log("register notification");

      const q = query(
        collection(db, "tokens"),
        where("email", "==", this.email)
      );
      const querySnapshot = await getDocs(q);
      const filteredData = querySnapshot.docs
        .filter((doc) => doc.data().email === this.email)
        .map((doc) => doc.data());

      console.log(JSON.stringify(filteredData));
      if (filteredData.length == 0) {
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === "prompt") {
          permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== "granted") {
          throw new Error("User denied permissions!");
        }
        await PushNotifications.register();
      } else {
        this.pushToken = filteredData[0].token;
      }
    },
    async getDeliveredNotifications() {
      const notificationList =
        await PushNotifications.getDeliveredNotifications();
      console.log("delivered notifications", notificationList);
    },
    getRelativeDate(timestamp) {
      return formatDistance(new Date(timestamp), new Date(), {
        addSuffix: true,
      });
    },
    async addNewQweet() {
      let newQweet = {
        content: this.newQweetContent,
        date: Date.now(),
        liked: false,
      };
      // this.qweets.unshift(newQweet);

      const docRef = await addDoc(collection(db, "qweets"), newQweet);
      console.log("Document written with ID: ", docRef.id);

      this.newQweetContent = "";
      this.imageUrl = "https://picsum.photos/500/300?t=" + Math.random();

      // console.log(this.qweets);
    },
    async deleteQweet(qweet) {
      await deleteDoc(doc(db, "qweets", qweet.id));

      console.log("Document deleted with ID: ", qweet.id);
    },
    async toggleLiked(qweet) {
      const qweetRef = doc(db, "qweets", qweet.id);
      await updateDoc(qweetRef, {
        liked: !qweet.liked,
      });

      console.log("Document updated with ID: ", qweet.id);
    },
    async captureImage() {
      // console.log("launch camera");
      // this.imageUrl = "https://picsum.photos/500/300?t=" + Math.random();

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        // resultType: CameraResultType.Base64,
        // resultType: CameraResultType.DataUrl,
        saveToGallery: true,
      });

      console.log(image);

      this.imageUrl = image.webPath;
      if (image.path) this.image = image.path;

      // this.imageUrl = `data:image/${image.format};base64,${image.base64String}`;
      // this.imageUrl = image.dataUrl;
      this.recognizeText2();
    },
    async recognizeText() {
      try {
        const worker = await createWorker("eng");
        const {
          data: { text },
        } = await worker.recognize(this.imageUrl);
        // this.newQweetContent = text;

        const textRows = text.split("\n");

        const idRegexNoPol = /[A-Z]{1,3}\s?\d{1,4}\s?[A-Z]{0,3}/g;
        const textResult = textRows.filter((line) => idRegexNoPol.test(line));

        if (textResult) {
          this.newQweetContent = textResult.join("\n");
        } else {
          this.newQweetContent = text;
        }
        // console.log(text);
        await worker.terminate();
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      }
    },
    async recognizeText2() {
      try {
        // Misalnya, kita anggap Ocr adalah objek yang memiliki metode detectText
        const data = await Ocr.detectText({ filename: this.image });

        this.newQweetContent = "";
        for (let detection of data.textDetections) {
          this.newQweetContent += detection.text + "\n";
          console.log(detection.text);
        }
      } catch (error) {
        console.error("Terjadi kesalahan:", error);
      }
    },
  },
});
</script>

<style lang="sass">
.new-qweet
  textarea
    font-size: 14px
    line-height: 1.4 !important
.divider
  border-top: 1px solid
  border-bottom: 1px solid
  border-color: $grey-3
.qweet-content
  white-space: pre-line
  line-height: 1.4 !important
.qweet-icons
  margin-left: -5px
</style>
