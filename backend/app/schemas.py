from pydantic import BaseModel, ConfigDict
from typing import List

class SectionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    heading: str
    page_num: int

class DocumentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str

class DocumentDetails(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    sections: List[SectionBase]

class RelatedContent(SectionBase):
    document_id: int
    document_title: str

class RecommendationResponse(BaseModel):
    related_content: List[RelatedContent]

class LLMInsightResponse(BaseModel):
    key_insight: str
    did_you_know: str
    counterpoint: str

class HealthCheck(BaseModel):
    status: str
