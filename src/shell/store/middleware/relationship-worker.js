// onmessage = function(msg) {
//   console.log("Worker message: ", msg);
//   fetch(msg.data[0])
//     .then(res => res.json())
//     .then(json => {
//       console.log("Worker API Succes: ", json);
//       postMessage(json);
//     })
//     .catch(err => {
//       console.log("Worker API Fail: ", err);
//       postMessage(err);
//     });
// };

onmessage = function(e) {
  // console.log("Message received from main script");
  var workerResult = "Result: " + e.data[0] * e.data[1];
  // console.log("Posting message back to main script");
  postMessage(workerResult);
};

// function API(uri) {
//   fetch(uri)
//     .then(res => res.json())
//     .then(json => {
//       console.log("Worker: ", json);
//       postMessage(json);
//     });
// }
