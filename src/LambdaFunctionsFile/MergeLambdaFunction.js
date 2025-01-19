import { Writable } from 'stream';
import { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand, PutObjectCommand, GetObjectTaggingCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// Helper function to convert stream to Buffer
const streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

export const handler = async (event) => {
  const bucket_name = 'testrecorddata';
  const uuid = event.uuid;

  if (!uuid) {
    return {
      statusCode: 400,
      message: 'Missing uuid parameter',
    };
  }

  const region = 'eu-north-1';


  const s3 = new S3Client({ region: region });


  const listParams = {
    Bucket: bucket_name,
  };

  // Create the command to list objects in the bucket
  const listObjectsCommand = new ListObjectsV2Command(listParams);

  // Send the command and get the objects
  const objects = await s3.send(listObjectsCommand);


  const audioFiles = [];
  for (const object of objects.Contents) {

    const tagParams = {
      Bucket: bucket_name,
      Key: object.Key,
    };

    const getObjectTaggingCommand = new GetObjectTaggingCommand(tagParams);
    const tags = await s3.send(getObjectTaggingCommand);

    // Check if the object has the tag uuid=${uuid}
    const hasUuidTag = tags.TagSet.some((tag) => tag.Key === 'uuid' && tag.Value === uuid);
    if (hasUuidTag && object.Key.endsWith('.mpeg')) {
      audioFiles.push(object);
    }
  }


   // Fetch and combine all the audio files that match the UUID tag
  const combinedAudio = await Promise.all(
    audioFiles.map(async (audioFile) => {
      const getParams = {
        Bucket: bucket_name,
        Key: audioFile.Key,
      };

      const getObjectCommand = new GetObjectCommand(getParams);
      const audio = await s3.send(getObjectCommand);

// Convert the audio stream to a buffer and return it
      const audioBuffer = await streamToBuffer(audio.Body);
      return audioBuffer;
    })
  ).then((buffers) => Buffer.concat(buffers));

// Generate a random file name for the combined audio file
  const file_name = randomUUID() + '.mpeg';

 // Set parameters to upload the combined audio file to S3
  const combinedAudioParams = {
    Bucket: bucket_name,
    Key: 'merged-audio-files/' + file_name,
    Body: combinedAudio,
    Tagging: 'combined_file=true',
  };

  const putObjectCommand = new PutObjectCommand(combinedAudioParams);
  await s3.send(putObjectCommand);

// Delete the original audio files after combining them
  await Promise.all(
    audioFiles.map(async (audioFile) => {
      const deleteParams = {
        Bucket: bucket_name,
        Key: audioFile.Key,
      };

        // Create the command to delete the audio file
      const deleteObjectCommand = new DeleteObjectCommand(deleteParams);
      await s3.send(deleteObjectCommand);
    })
  );


  return {
    statusCode: 200,
    file_name: file_name,
  };
};