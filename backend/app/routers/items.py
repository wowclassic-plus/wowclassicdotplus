from fastapi import APIRouter

router = APIRouter(
    prefix="/items",
    tags=["items"]
)

@router.get("/")
def read_items():
    return [{"item_id": 1, "name": "Item One"}]
