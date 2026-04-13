import os
import base64
import httpx
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import replicate

app = FastAPI(title="Fabric Try-On API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTFIT_PROMPTS = {
    "kurta": "wearing a traditional Indian kurta made from this fabric, long tunic style, full length view",
    "suit": "wearing a formal Indian suit set made from this fabric, kurta with churidar pants",
    "shirt": "wearing a casual Indian cotton shirt made from this fabric, collar shirt",
    "lehenga": "wearing a beautiful Indian lehenga made from this fabric, flared skirt with blouse",
    "saree": "wearing an Indian saree draped elegantly made from this fabric, traditional draping style",
    "salwar_kameez": "wearing a salwar kameez set made from this fabric, traditional Indian outfit",
    "sherwani": "wearing a royal Indian sherwani made from this fabric, formal occasion wear",
    "anarkali": "wearing an Anarkali suit made from this fabric, flared floor-length kurta",
}

def image_to_data_uri(image_bytes: bytes, content_type: str) -> str:
    encoded = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:{content_type};base64,{encoded}"


@app.post("/generate")
async def generate_tryon(
    person_image: UploadFile = File(...),
    fabric_image: UploadFile = File(...),
    outfit_type: str = Form(...),
):
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not set in environment")

    person_bytes = await person_image.read()
    fabric_bytes = await fabric_image.read()

    outfit_desc = OUTFIT_PROMPTS.get(outfit_type, OUTFIT_PROMPTS["kurta"])

    prompt = (
        f"A person {outfit_desc}, "
        "high quality photo, realistic fabric texture, detailed clothing, "
        "natural lighting, fashion photography style, Indian traditional wear"
    )

    negative_prompt = (
        "ugly, blurry, low quality, distorted face, extra limbs, "
        "bad anatomy, unrealistic, cartoon, sketch"
    )

    person_data_uri = image_to_data_uri(person_bytes, person_image.content_type)
    fabric_data_uri = image_to_data_uri(fabric_bytes, fabric_image.content_type)

    try:
        output = replicate.run(
            "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4af4a36396ad15aa6b2bc6c4c3a2f5f7a4",
            input={
                "image": person_data_uri,
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "prompt_strength": 0.6,   # how much to change vs keep original
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "scheduler": "K_EULER",
            }
        )

        if isinstance(output, list) and len(output) > 0:
            image_url = str(output[0])
        else:
            image_url = str(output)

        async with httpx.AsyncClient() as client:
            img_response = await client.get(image_url)
            img_bytes = img_response.content

        result_b64 = base64.b64encode(img_bytes).decode("utf-8")
        return JSONResponse({
            "success": True,
            "image_base64": result_b64,
            "prompt_used": prompt,
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}
