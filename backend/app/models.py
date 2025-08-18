from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    filepath = Column(String, unique=True)
    sections = relationship("Section", back_populates="document", cascade="all, delete-orphan")

class Section(Base):
    __tablename__ = "sections"
    id = Column(Integer, primary_key=True, index=True)
    heading = Column(String)
    content = Column(Text)
    page_num = Column(Integer)
    embedding = Column(Text) # Stored as a JSON string of a list
    document_id = Column(Integer, ForeignKey("documents.id"))
    document = relationship("Document", back_populates="sections") 
