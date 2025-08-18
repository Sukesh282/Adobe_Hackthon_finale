import os
import json
import asyncio
from pydantic_settings import BaseSettings
from openai import OpenAI, AzureOpenAI
import google.generativeai as genai
import azure.cognitiveservices.speech as speechsdk

class Settings(BaseSettings):
    """Loads environment variables for external APIs."""
    LLM_PROVIDER: str = ""
    # OpenAI
    OPENAI_API_KEY: str = "sk-..."
    OPENAI_MODEL: str = "gpt-4o"
    # Azure OpenAI
    AZURE_OPENAI_KEY: str = "..."
    AZURE_OPENAI_ENDPOINT: str = "https://..."
    AZURE_DEPLOYMENT_NAME: str = "gpt-4o"
    # Gemini
    GOOGLE_API_KEY: str = "..."
    GEMINI_MODEL: str = "gemini-1.5-flash"
    # Azure TTS
    TTS_PROVIDER: str = ""
    AZURE_TTS_KEY: str = ""
    AZURE_TTS_ENDPOINT: str = ""

settings = Settings()

# Configure Google Generative AI client
if settings.LLM_PROVIDER == "gemini" and settings.GOOGLE_API_KEY:
    genai.configure(api_key=settings.GOOGLE_API_KEY)

PROMPT_TEMPLATE = """
You are an advanced insight generation assistant. Given the following text from a document, provide three distinct pieces of information in a structured JSON format:
1.  **key_insight**: The single most important takeaway or summary of the text. (1-2 sentences)
2.  **did_you_know**: An interesting, lesser-known fact, or a "Did you know?" style piece of information related to the text's main topic.
3.  **counterpoint**: A potential contradiction, counterargument, or alternative perspective to the main point of the text. If no direct counterpoint exists, provide a thoughtful question that challenges the text's assumptions.
Here is the text:
---
{context}
---
Provide your response as a single, valid JSON object with ONLY the keys "key_insight", "did_you_know", and "counterpoint". Do not include any other text, explanations, or markdown formatting.
"""

def _get_llm_insights_sync(context: str) -> dict:
    """Synchronous function to call the appropriate LLM provider."""
    prompt = PROMPT_TEMPLATE.format(context=context)
    
    try:
        if settings.LLM_PROVIDER == "openai":
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(model=settings.OPENAI_MODEL, messages=[{"role": "user", "content": prompt}], response_format={"type": "json_object"})
            return json.loads(response.choices.model_dump_json())

        elif settings.LLM_PROVIDER == "azure":
            client = AzureOpenAI(api_key=settings.AZURE_OPENAI_KEY, azure_endpoint=settings.AZURE_OPENAI_ENDPOINT, api_version="2024-02-01")
            response = client.chat.completions.create(model=settings.AZURE_DEPLOYMENT_NAME, messages=[{"role": "user", "content": prompt}], response_format={"type": "json_object"})
            return json.loads(response.choices.model_dump_json())

        elif settings.LLM_PROVIDER == "gemini":
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            response = model.generate_content(prompt)
            # Clean up potential markdown formatting from the response
            clean_response = response.text.strip().lstrip("```json").rstrip("```")
            return json.loads(clean_response)
        
    except Exception as e:
        print(f"Error calling LLM provider '{settings.LLM_PROVIDER}': {e}")
        # Fallback response on error
        return { "key_insight": "Could not generate insight due to an API error.", "did_you_know": "...", "counterpoint": "..."}

    # Default fallback
    return {
        "key_insight": "LLM provider is not configured. This is a placeholder insight.",
        "did_you_know": "You can set up an LLM provider using environment variables to enable this feature.",
        "counterpoint": "How can we ensure AI-generated insights are accurate and unbiased?"
    }

def _generate_audio_sync(text: str, filename: str) -> bool:
    """Synchronous function to call the TTS provider."""
    if settings.TTS_PROVIDER == "azure" and settings.AZURE_TTS_KEY and settings.AZURE_TTS_ENDPOINT:
        try:
            speech_config = speechsdk.SpeechConfig(subscription=settings.AZURE_TTS_KEY, endpoint=settings.AZURE_TTS_ENDPOINT)
            speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"
            audio_config = speechsdk.audio.AudioOutputConfig(filename=filename)
            synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
            result = synthesizer.speak_text_async(text).get()
            return result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted
        except Exception as e:
            print(f"Azure TTS Error: {e}")
            return False
    else:
        print("TTS provider not configured or keys are missing.")
        return False

async def get_llm_insights(context: str):
    """Asynchronously run the I/O-bound LLM call in a separate thread."""
    return await asyncio.to_thread(_get_llm_insights_sync, context)

async def generate_audio(text: str, filename: str):
    """Asynchronously run the I/O-bound TTS call in a separate thread."""
    return await asyncio.to_thread(_generate_audio_sync, text, filename) 
