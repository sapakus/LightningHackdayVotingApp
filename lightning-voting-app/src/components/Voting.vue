<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <v-stepper v-model="e6" vertical>
      <v-stepper-step :complete="e6 > 1" step="1">
        <v-btn id="section-title" @click="e6 = 1">What's your node?</v-btn>
        <small>prove ownership of your node by signing a message</small>
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-card color="grey lighten-3" class="py-3 mb-5">
          <div>
            Do `yourLightningNode.signMessage("satoshi")` and input signature below
          </div>
          <div color="white" class="pt-3">
            <input id="signature" v-model="message_signature" placeholder="paste it here">
            <v-btn flat icon color="primary" @click="verifySignature()">
              <v-icon>arrow_forward</v-icon>
            </v-btn>
          </div>
        </v-card>
        <v-btn color="primary" @click="e6 = 2" :disabled="!isNodeVerified">Continue</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="e6 > 2" step="2">
        <v-btn id="section-title" @click="e6 = 2">Don't forget to vote</v-btn>
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-layout row wrap>
          <v-flex v-for="i in 3" :key="`4${i}`" xs4>
            <v-card id="lapp" class="py-3 ma-2">
              <v-card-title primary-title>
                <div>
                  <h3 class="headline mb-0">Kangaroo Valley Safari</h3>
                </div>
              </v-card-title>

              <v-card-actions class="ml-4">
                <input type="checkbox" id="checkbox">
                <label for="checkbox">⚡️vote for me</label>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
        <v-btn color="primary" @click="e6 = 3">Continue</v-btn>
        <v-btn flat @click="e6 = 1">Back</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="e6 > 3" step="3">
        <v-btn id="section-title" @click="e6 = 3">Checkout results</v-btn>
      </v-stepper-step>

      <v-stepper-content step="3">
        <v-card color="grey lighten-1" class="mb-5" height="200px"></v-card>
        <v-btn color="primary" @click="e6 = 4">Continue</v-btn>
        <v-btn flat @click="e6 = 2">Back</v-btn>
      </v-stepper-content>

    </v-stepper>

  </div>
</template>

<script>
export default {
  name: "Voting",
  props: {
    msg: String
  },
  data() {
    return {
      e6: 1,
      message_signature: "",
      isNodeVerified: false,
      node_id: ""
    };
  },
  methods: {
    verifySignature() {
      this.$socket.emit("yo_election_server", {
        subject: "VerifyMessage",
        payload: {
          msg: "satoshi",
          signature: this.message_signature
        },
        from: "voting_ui"
      });
    }
  },
  sockets: {
    yo_voting_ui(envelope) {
      if (envelope.subject === "MessageVerified") {
        //do something

        console.log("MessageVerified");
        console.log(envelope);

        var msg = envelope.payload.msg;
        var sig = envelope.payload.signature;
        var node_id = envelope.payload.node_id;

        if (
          msg === "satoshi" &&
          sig === this.message_signature &&
          envelope.payload.valid
        ) {
          this.node_id = node_id;
          this.isNodeVerified = true;
        }
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#signature {
  border: solid;
  border-radius: 2px;
  border-width: 1px;
  text-align: center;
}
#lapp {
  border: solid;
}
#section-title:hover {
  cursor: pointer;
}
</style>
