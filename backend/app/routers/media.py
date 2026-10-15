"""Media service router for presigned S3 upload URLs and asset management."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UploadUrlRequest, UploadUrlResponse
from app.utils.s3 import generate_presigned_upload_url, delete_file
from app.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/media", tags=["Media Service"])


@router.post(
    "/upload-url",
    response_model=UploadUrlResponse,
    summary="Get presigned S3/MinIO upload URL for direct file upload",
)
async def get_upload_url(
    data: UploadUrlRequest,
    current_user: User = Depends(get_current_user),
):
    # Validate file type
    allowed_types = settings.ALLOWED_IMAGE_TYPES + settings.ALLOWED_VIDEO_TYPES + settings.ALLOWED_DOC_TYPES
    if data.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Content-type '{data.content_type}' is not supported",
        )

    # Generate a unique key partitioned by user and purpose
    ext = data.filename.split(".")[-1] if "." in data.filename else "bin"
    file_id = uuid.uuid4()
    file_key = f"{data.purpose}/{current_user.id}/{file_id}.{ext}"

    try:
        res = generate_presigned_upload_url(file_key=file_key, content_type=data.content_type)
        return UploadUrlResponse(**res)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate upload URL: {str(e)}",
        )


@router.delete(
    "/{file_key:path}",
    summary="Delete uploaded media asset",
)
async def remove_media(
    file_key: str,
    current_user: User = Depends(get_current_user),
):
    # Basic permission guard: the user's ID must be part of the file_key
    if str(current_user.id) not in file_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this file",
        )

    try:
        delete_file(file_key)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}",
        )
