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
  // Check if the event body exists and is Base64 encoded (indicating a file upload)
  
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
      // Generate a pre-signed URL that can be used to upload the file to S3 (valid for 60 seconds)
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
