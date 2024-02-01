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
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

export default defineComponent({
  name: "PageHome",
  data() {
    return {
      newQweetContent: "",
      qweets: [
        // {
        //   id: "ID1",
        //   content:
        //     "Life is change. Growth is optional. Choose wisely.\n\nKaren Clark, type.fit",
        //   date: 1706770598526,
        //   liked: true,
        // },
        // {
        //   id: "ID2",
        //   content:
        //     "Difficulties increase the nearer we get to the goal.\n\nJohann Wolfgang von Goethe, type.fit",
        //   date: 1706770598526,
        //   liked: true,
        // },
        // {
        //   id: "ID3",
        //   content:
        //     "You can observe a lot just by watching.\n\nYogi Berra, type.fit",
        //   date: 1706770598526,
        //   liked: false,
        // },
        // {
        //   id: "ID4",
        //   content: "Well begun is half done.\n\nAristotle, type.fit",
        //   date: 1706770598526,
        //   liked: true,
        // },
        // {
        //   id: "ID5",
        //   content:
        //     "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        //   date: 1706761859179,
        //   liked: false,
        // },
        // {
        //   id: "ID6",
        //   content:
        //     "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,",
        //   date: 1706761896523,
        //   liked: false,
        // },
      ],
      unsubscribe: null,
    };
  },
  methods: {
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
  },
  mounted() {
    const q = query(collection(db, "qweets"), orderBy("date"));
    this.unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let qweetChange = change.doc.data();
        qweetChange.id = change.doc.id;
        if (change.type === "added") {
          console.log("New qweet: ", qweetChange);
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
  },
  unmounted() {
    console.log("unmounted");
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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