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

const subscribeToInvoices = (envelope, cb) => {
  console.log("Subscribing To Invoices");
  const sub = lnd.subscribeInvoices({});
  sub.on("data", invoice => {
    console.log(invoice);
    cb(null, envelope.from, {
      subject: "InvoiceUpdated",
      payload: invoice
    });
  });
};

const verifyMessage = (envelope, cb) => {
  lnd.verifyMessage(
    {
      msg: envelope.payload.msg,
      signature: envelope.payload.signature
    },
    (err, res) => {
      if (err) {
        cb(err);
      } else {
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
    }
  );
};

module.exports = {
  handleRequests(envelope, cb) {
    console.log("HANDLING LIGHTNING REQUESTS...");

    var requestHandlers = {
      GetLightningInfo: this.getWalletInfo,
      // SubscribeToLightningInvoices: this.subscribeToInvoices,
      VerifyMessage: this.verifyMessage
    };

    const handler = requestHandlers[envelope.subject];

    if (handler) {
      handler(envelope, cb);
    }
  }
};
