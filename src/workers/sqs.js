const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");

const { reader } = require("../services/s3");
const sharp = require("sharp");
const { Consumer } = require("sqs-consumer");
const AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  Bucket: process.env.AWS_BUCKET_NAME,
});

const queueUrl = process.env.AWS_SQS_SUCCESS_QUEUE_URL;

function resizeImage(message) {
  let sqsMessage = JSON.parse(message.Body);
  const { ETag, Location, Key, visibility, resizeTo, sessionId } = sqsMessage;
  reader(Key, (s3ReadError, s3Image) => {
    if (s3ReadError) {
      console.log(`SQSError | Error: ${s3ReadError}`);
    } else {
      const inputBuffer = new Buffer(s3Image.Body, "binary");
      let resizeBy = [175, 175];
      switch (resizeTo) {
        case 0.75:
          resizeBy = [250, 250];
          break;
        case 0.5:
          resizeBy = [175, 175];
          break;
        case 0.25:
          resizeBy = [75, 75];
          break;
        default:
          break;
      }
      sharp(inputBuffer)
        .resize(resizeBy[0], resizeBy[1])
        .toBuffer((sharpError, fileBuffer) => {
          if (sharpError) {
            console.log(`SharpError | Error: ${sharpError}`);
          } else {
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: `resized/${Key}`,
              Body: fileBuffer,
              Metadata: { sessionId, resizeTo },
            };
            if (visibility) params.Tagging = "public=yes";
            s3.putObject(params, (s3Error, data) => {
              if (s3Error) {
                console.log(`S3Error | Error: ${s3Error}`);
              } else {
                console.log("Updating resize socket");
                axios
                  .get(`http://localhost:${process.env.PORT}/resized`, {
                    params: { originalKey: Key, resizedKey: `resized/${Key}` },
                  })
                  .then(({ data }) => console.log(data))
                  .catch((error) => console.log(error));
                console.log(`S3Upload | SUCCESS: ${data}`);
              }
            });
          }
        });
    }
  });
}

const app = Consumer.create({
  queueUrl,
  handleMessage: async (message) => {
    resizeImage(message);
  },
  sqs: new AWS.SQS(),
});

app.on("error", (err) => {
  console.error(err.message);
});

app.on("processing_error", (err) => {
  console.error(err.message);
});

console.log("Image Resizer Running...");
app.start();
