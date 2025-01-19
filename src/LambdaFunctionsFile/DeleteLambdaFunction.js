import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'eu-north-1' }); 

export const handler = async (event) => {
  const file_name = event.file_name;  
  const bucketName = 'testrecorddata'; 
  const objectKey = `merged-audio-files/${file_name}`;  


  const deleteParams = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {

    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);

    return {
      statusCode: 200,
      message: `Successfully deleted file ${file_name}.`
    };
  } catch (error) {
    console.error('Error deleting file:', error);

    return {
      statusCode: 500,
      message: `Error deleting file ${file_name}.`,
      error: error.message,
    };
  }
};
