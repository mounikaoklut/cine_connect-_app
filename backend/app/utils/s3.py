try:
    import boto3
    from botocore.config import Config
except ImportError:
    boto3 = None
    Config = None

from app.config import get_settings

settings = get_settings()

s3_client = (
    boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION,
        config=Config(signature_version="s3v4"),
    )
    if boto3 and Config
    else None
)


def ensure_bucket_exists():
    """Create the media bucket if it doesn't exist."""
    if not s3_client:
        return
    try:
        s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
    except Exception:
        s3_client.create_bucket(
            Bucket=settings.S3_BUCKET_NAME,
            CreateBucketConfiguration={"LocationConstraint": settings.S3_REGION},
        )


def generate_presigned_upload_url(
    file_key: str,
    content_type: str,
    expires_in: int = 3600,
) -> dict:
    """Generate a presigned PUT URL for direct client upload.

    Returns:
        dict with upload_url, file_key, and cdn_url
    """
    if not s3_client:
        return {
            "upload_url": f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{file_key}",
            "file_key": file_key,
            "cdn_url": f"{settings.CDN_BASE_URL}/{file_key}",
        }

    upload_url = s3_client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": file_key,
            "ContentType": content_type,
        },
        ExpiresIn=expires_in,
    )

    cdn_url = f"{settings.CDN_BASE_URL}/{file_key}"

    return {
        "upload_url": upload_url,
        "file_key": file_key,
        "cdn_url": cdn_url,
    }


def delete_file(file_key: str):
    """Delete a file from S3."""
    if not s3_client:
        return
    s3_client.delete_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=file_key,
    )
