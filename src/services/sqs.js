// Import the AWS SDK
const AWS = require("aws-sdk");
AWS.config.update({
  region: process.env.AWS_REGION,
});

const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const successQueueUrl = process.env.AWS_SQS_SUCCESS_QUEUE_URL;
const failureQueueUrl = process.env.AWS_SQS_FAILRE_QUEUE_URL;

const resizeQueuer = (success, data, cb) => {
  const { Location, Bucket, Key, ETag, visibility, resizeTo, sessionId } = data;
  const resizeData = {
    MessageAttributes: {
      Location: {
        DataType: "String",
        StringValue: Location,
      },
      Bucket: {
        DataType: "String",
        StringValue: Bucket,
      },
      Key: {
        DataType: "String",
        StringValue: Key,
      },
      ETag: {
        DataType: "String",
        StringValue: ETag,
      },
      visibility: {
        DataType: "Number",
        StringValue: visibility ? "1" : "0",
      },
      resizeTo: {
        DataType: "String",
        StringValue: resizeTo,
      },
      sessionId: {
        DataType: "String",
        StringValue: sessionId,
      },
    },
    MessageBody: JSON.stringify(data),
  };

  resizeData.QueueUrl = success ? successQueueUrl : failureQueueUrl;

  sqs
    .sendMessage(resizeData)
    .promise()
    .then((data) => {
      console.log(`ResizeService | SUCCESS: ${data.MessageId}`);
    })
    .catch((error) => {
      console.log(`ResizeService | ERROR: ${error}`);
    });
};

module.exports = {
  resizeQueuer,
};
