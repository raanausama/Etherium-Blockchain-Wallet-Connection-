const dotenv = require("dotenv");
// const pools2 = require("./db/pool");

dotenv.config();
const express = require("express");
const cors = require("cors");
const authorize = require("./middleware/authorization");
//Socket
const { Server } = require("socket.io");

const { addNewUser, removeUser, getUser } = require("./utils/socketFunctions");

const io = new Server({
  cors: {
    origin: "*",
    // origin: process.env.frontSocketUrlLive,
  },
});

const port = process.env.PORT || 5001;
const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

const notificationsRouter = require("./services/user/Notifications");
// const myinfoRouter = require("./services/myinfo/myinfoServies");


app.use("/Notification", notificationsRouter);
// app.use("/myinfo", myinfoRouter);


// Client Routes
const blockchainRouter = require("./routes/client/blockchainRoutes");

app.use("/blockchain", authorize, blockchainRouter);



app.get('/', (req, res) => {
  res.send('Hello World!');
})


const EtheriumConnection = require("./sevices/EtheriumConnection");
app.use("/EtheriumConnection", authorize, EtheriumConnection);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// print stacktrace on error
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});



try {
  io.on("connection", (socket) => {


    socket.on("newUser", (user) => {
      console.log(
        "new connection with socket id",
        user.username + " : " + socket.id
      );
      // console.log("typeof", typeof socket.id);
      addNewUser(user, socket.id);
    });

    socket.on("sendNotification", async ({ sender, receivers, type }) => {
      // console.log("sender", sender);
      // console.log("recievers", receivers);
      await receivers.forEach(async (reciever) => {
        const aReceiver = await getUser(reciever.username);
        // console.log("receiver", aReceiver);
        if (typeof aReceiver != "undefined") {
          io.to(aReceiver.socket_id).emit("getNotification", {
            sender,
          });
        }
      });
    });


    socket.on("sendText", ({ sender_id, receiver_id, text }) => {
      const receiver = getUser(receiver_id);
      io.to(receiver.socketId).emit("getText", {
        sender_id,
        text,
      });
    });
    io.on("error", () => {
      socket.emit("my error", "Something bad happened!");
    });
    socket.on("disconnect", () => {
      // console.log("disconnected");
      removeUser(socket.id);
    });
  });
} catch (error) {
  console.error(error.message);
  res.status(500).send("Server error");
}


app.listen(port, () => { });
io.listen(5001, () => {
  return // console.log(`server is listening on ${port}`);
});

