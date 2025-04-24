from pydantic import BaseModel


class PhotoBase(BaseModel):
    file_url: str


class PhotoCreate(PhotoBase):
    pass


class Photo(PhotoBase):
    id: int

    class Config:
        from_attributes = True
