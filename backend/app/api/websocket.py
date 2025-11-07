"""WebSocket API for real-time updates"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio

router = APIRouter()

@router.websocket("/pipeline/{pipeline_id}")
async def websocket_endpoint(websocket: WebSocket, pipeline_id: str):
    """WebSocket for pipeline execution updates"""
    await websocket.accept()
    try:
        while True:
            # TODO: Send real-time execution updates
            await websocket.send_json({
                "pipeline_id": pipeline_id,
                "status": "running",
                "message": "Pipeline executing..."
            })
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
