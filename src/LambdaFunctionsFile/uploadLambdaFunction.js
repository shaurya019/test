import fs from 'fs';
import crypto from 'crypto';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Initialize the S3 client
const s3 = new S3Client({ region: 'eu-north-1' });
const BUCKET_NAME = 'testrecorddata';

// Lambda handler function
export const handler = async (event) => {

  let uuid = event.uuid;

  if (!uuid) {
    uuid = crypto.randomUUID(); 
  }

  if (event.body && event.isBase64Encoded) {
    const file_name = crypto.randomUUID();
    // upload to s3 with tag uuid=uuid
    const key = `tmp-recordings/${file_name}.mpeg`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Tagging: `uuid=${uuid}`
    };

    const command = new PutObjectCommand(params);
  
    try {
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
      return {
        statusCode: 200,
        URL: uploadUrl,
        uuid
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  }
};
