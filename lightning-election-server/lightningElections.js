var fs = require("fs");
const grpc = require("grpc");
const { loadSync } = require("@grpc/proto-loader");

//#region "setup"

process.env.GRPC_SSL_CIPHER_SUITES = "HIGH+ECDSA";
const lndLocation = "/Users/sadiq/Library/Application Support/Lnd/";
const macarooon = fs.readFileSync(`${lndLocation}admin.macaroon`);
const lndCert = fs.readFileSync(`${lndLocation}tls.cert`);
const ssl = grpc.credentials.createSsl(lndCert);

const macaroonData = Buffer.from(macarooon).toString("hex");

const macCreds = grpc.credentials.createFromMetadataGenerator((_, cbk) => {
  const metadata = new grpc.Metadata();
  metadata.add("macaroon", macaroonData);
  return cbk(null, metadata);
});

const combined = grpc.credentials.combineChannelCredentials(ssl, macCreds);

const packageDefinition = loadSync("./rpc.proto", {
  defaults: true,
  enums: String,
  keepCase: true,
  longs: String,
  oneofs: true
});

const lnrpcDescriptor = grpc.loadPackageDefinition(packageDefinition);
const lnrpc = lnrpcDescriptor.lnrpc;
const lnd = new lnrpc.Lightning("localhost:10009", combined);

//#endregion

const getWalletInfo = (envelope, cb) => {
  console.log("Getting wallet info:");
  try {
    lnd.getInfo({}, function(err, response) {
      if (err) {
        cb(null, envelope.from, {
          subject: "GotLightningInfo",
          error: err
        });
        console.log(err);
      } else {
        console.log(response);
        cb(null, envelope.from, {
          subject: "GotLightningInfo",
          payload: response
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const subscribeToVotes = (envelope, cb) => {
  console.log("Subscribing To Votes");
  const sub = lnd.subscribeInvoices({});
  sub.on("data", invoice => {
    console.log(invoice);

    const vote = parseMemoAsVote(invoice.memo);
    if (vote && invoice.settled) {
      const payload = {
        vote: vote,
        invoice: invoice
      };
      cb(null, envelope.from, {
        subject: "VoteReceived",
        payload: payload
      });
    }
  });
};

const getAllVotes = (envelope, cb) => {
  const votes = {};

  lnd.listInvoices(
    {
      pending_only: false
    },
    (err, response) => {
      if (err) {
        cb(err);
      }

      if (response) {
        const voteInvoices = response.invoices.filter(
          inv => parseMemoAsVote(inv.memo) != null
        );

        voteInvoices.forEach(v => {
          votes[voteInvoices.node_id] = v;
        });

        cb(null, envelope.from, {
          subject: "GotAllVotes",
          payload: votes
        });
      }
    }
  );
};

const parseMemoAsVote = memo => {
  const x = memo.split(":");

  if (x.length === 3 && x[0] === "TEST_ELECTION") {
    const vote = {
      node_id: x[1],
      vote_choice: x[2],
      invoice: invoice
    };
    return vote;
  } else {
    return null;
  }
};

const verifyMessage = (envelope, cb) => {
  console.log("verifying message...");

  var msgBytes = [];
  var str = envelope.payload.msg;
  var buffer = new Buffer(str, "utf8");
  for (var i = 0; i < buffer.length; i++) {
    msgBytes.push(buffer[i]);
  }

  const verifyMessageReq = {
    msg: msgBytes,
    signature: envelope.payload.signature
  };

  console.log(verifyMessageReq);

  lnd.verifyMessage(verifyMessageReq, (err, res) => {
    if (err) {
      cb(err);
    } else {
      console.log(res);
      var payload = {
        msg: envelope.payload.msg,
        signature: envelope.payload.signature,
        valid: res.valid,
        node_id: res.pubkey
      };
      cb(null, envelope.from, {
        subject: "MessageVerified",
        payload: payload
      });
    }
  });
};

const createVoteInvoice = (envelope, cb) => {
  const memo = `TEST_ELECTION:${envelope.payload.node_id}:${
    envelope.payload.vote_choice
  }`;

  memo = memo.substring(0, 250);

  lnd.addInvoice(
    {
      memo: memo,
      value: 0,
      expiry: 3600,
      private: true
    },
    (err, response) => {
      if (err) {
        cb(err);
      } else if (response) {
        const invoice = { invoice: response.payment_request };
        cb(null, msg.from, {
          subject: "VotingInvoiceCreated",
          payload: invoice
        });
      }
    }
  );

  //cb
};

module.exports = {
  handleRequests(envelope, cb) {
    console.log("HANDLING LIGHTNING REQUESTS...");

    var requestHandlers = {
      GetLightningInfo: getWalletInfo,
      VerifyMessage: verifyMessage,
      CreateVoteInvoice: createVoteInvoice,
      SubscribeToVotes: subscribeToVotes,
      GetAllVotes: getAllVotes
    };

    const handler = requestHandlers[envelope.subject];

    if (handler) {
      handler(envelope, cb);
    }
  }
};
