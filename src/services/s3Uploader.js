const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  Bucket: process.env.AWS_BUCKET_NAME,
});

const s3Uploader = (req, res, cb) => {
  const { session, files, body } = req;
  const { visibility, resizeTo } = body;
  const sessionId = session.id;
  const { io } = res;
  const totalSize = files.reduce((size, file) => {
    return size + file.size;
  }, 0);
  let alreadyLoaded = 0;
  files.map((file, index) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${file.originalname}-${new Date().toISOString()}`,
      Body: file.buffer,
      Metadata: { sessionId, resizeTo },
    };
    if (visibility) params.Tagging = "public=yes";
    s3.upload(params)
      .on("httpUploadProgress", function (event) {
        const { loaded } = event;
        alreadyLoaded = alreadyLoaded + loaded;
        const progress = (alreadyLoaded / totalSize) * 100;
        io.emit("uploadProgress", {
          progress,
        });
      })
      .send(cb);
  });
};

module.exports = {
  s3Uploader,
};
