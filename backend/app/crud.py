from sqlalchemy.orm import Session, joinedload
from . import models

def get_document(db: Session, doc_id: int):
    return db.query(models.Document).filter(models.Document.id == doc_id).first()

def get_documents(db: Session):
    return db.query(models.Document).order_by(models.Document.id.desc()).all()

def get_sections_by_doc_id(db: Session, doc_id: int):
    # Use joinedload to prevent N+1 query problem when accessing document.filename
    return db.query(models.Section).options(joinedload(models.Section.document)).filter(models.Section.document_id == doc_id).order_by(models.Section.page_num).all()

def get_all_sections_except(db: Session, doc_id: int):
    # Also use joinedload here for efficiency
    return db.query(models.Section).options(joinedload(models.Section.document)).filter(models.Section.document_id != doc_id).all()

def create_document(db: Session, filename: str, filepath: str) -> models.Document:
    db_doc = models.Document(filename=filename, filepath=filepath)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

def create_sections(db: Session, sections_data: list):
    db_sections = [models.Section(**s) for s in sections_data]
    db.add_all(db_sections)
    db.commit() 
