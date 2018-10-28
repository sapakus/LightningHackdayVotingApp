<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <v-stepper v-model="e6" vertical>
      <v-stepper-step :complete="e6 > 1" step="1">
        <v-btn id="section-title" @click="e6 = 1">What's your node?</v-btn>
        <small>provide us with your node id</small>
      </v-stepper-step>

      <v-stepper-content step="1">
        <v-card  class="py-3 mb-5">
          <div color="white" class="pt-3">
            <v-text-field placeholder="paste your node id here" v-model="node_id"></v-text-field>
            <v-btn flat icon color="primary" @click="verifySignature()">
              <v-icon>arrow_forward</v-icon>
            </v-btn>
          </div>
        </v-card>
        <v-btn color="primary" @click="e6 = 2" :disabled="!isNodeVerified">Continue</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="e6 > 2" step="2">
        <!-- the one with :disabled is the one we should use, just leaving commented so i can move around -->
        <!-- <v-btn id="section-title" @click="e6 = 2" :disabled="!isNodeVerified">Don't forget to vote</v-btn> -->
        <v-btn id="section-title" @click="e6 = 2">Take your pick</v-btn>
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-layout row wrap>
          <v-flex v-for="choice in choices" :key="choice.id" xs4>
            <v-card id="lapp" class="py-3 ma-2">
              <v-card-title primary-title>
                <div>
                  <h3 class="headline mb-0">{{choice.name}}</h3>
                </div>
              </v-card-title>

              <v-card-actions class="ml-4">
                <label><input type="radio" name="choice" v-model="vote_selection" v-bind:value="choice">⚡️vote for me</label>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
        <v-btn color="primary" @click="castVote()">Cast vote</v-btn>
        <v-btn flat @click="e6 = 1">Back</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="e6 > 3" step="3">
        <v-btn id="section-title" @click="e6 = 3">Cast vote</v-btn>
      </v-stepper-step>

      <v-stepper-content step="3">
        <v-card color="grey lighten-3" class="mb-5">
          [QR invoce info]
        </v-card>
        <v-btn color="primary" @click="e6 = 4">Continue</v-btn>
        <v-btn flat @click="e6 = 2">Back</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="e6 > 4" step="4">
        <v-btn id="section-title" @click="e6 = 4">Checkout results</v-btn>
      </v-stepper-step>

      <v-stepper-content step="4">
        <v-layout row wrap>
          <v-flex v-for="choice in choices" :key="choice.id" xs4>
            <v-card id="lapp" class="py-3 ma-2">
              <v-card-title primary-title>
                <div>
                  <h3 class="headline mb-0">{{choice.name}}: {{choice.voteTotal}}</h3>
                </div>
              </v-card-title>
            </v-card>
          </v-flex>
        </v-layout>
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
      node_id: "",
      choices: [
        {
          name: "some cool demo",
          voteTotal: 0
        },
        {
          name: "potato chips",
          voteTotal: 0
        },
        {
          name: "the third world",
          voteTotal: 0
        },
      ],
      vote_selection: ""
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
    },
    castVote() {
      this.e6 = 3; // move to next step

      this.choices.filter(choice => {
        if (choice.name === this.vote_selection.name) {
          choice.voteTotal++;
        }
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
#lapp {
  border: solid;
}
#section-title:hover {
  cursor: pointer;
}
</style>
