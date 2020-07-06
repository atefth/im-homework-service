const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  Bucket: process.env.AWS_BUCKET_NAME,
});

const uploader = (req, res, cb) => {
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
      Key: `${sessionId}/${file.originalname}-${new Date().toISOString()}.${
        file.mimetype.split("/")[1]
      }`,
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

const prober = (req, resized, cb) => {
  const { session } = req;
  const sessionId = session.id;
  // const sessionId = "9f256b6e-01fa-4ea2-9500-a1132c67bbb5";
  const prefix = resized ? `resized/${sessionId}/` : `${sessionId}/`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delimiter: "/",
    Prefix: prefix,
  };
  s3.listObjects(params, cb);
};

const reader = (key, cb) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  s3.getObject(params, cb);
};

const signedUrl = (key, cb) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  s3.getSignedUrl("getObject", params, cb);
};

module.exports = {
  uploader,
  prober,
  reader,
  signedUrl,
};
