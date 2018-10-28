<template>
  <div id="app">
    <v-app>
      <v-layout row wrap>
        <v-flex>
          <v-card>
            <v-card-title> Ping Server</v-card-title>
            <v-card-text>
              {{isConnected}}
              <v-btn color="success" @click="pingServer()">Ping</v-btn>

              {{msg_from_server}}

            </v-card-text>
          </v-card>

        </v-flex>
      </v-layout>
      <voting msg="reckless ⚡️ voting" />
    </v-app>
  </div>
</template>

<script>
import Voting from "./components/Voting.vue";

export default {
  name: "app",
  components: {
    Voting
  },
  data() {
    return {
      msg_from_server: "...",
      isConnected: false
    };
  },
  methods: {
    pingServer() {
      this.$socket.emit("yo_election_server", {
        subject: "PING!"
      });
    }
  },
  sockets: {
    connect() {
      // Fired when the socket connects.
      this.isConnected = true;
    },
    disconnect() {
      this.isConnected = false;
    },
    // Fired when the server sends something on the "messageChannel" channel.
    messageChannel(data) {
      // console.log("wtf");
      this.msg_from_server = data;
    }
  }
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
