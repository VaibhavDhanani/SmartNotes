from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint,CheckConstraint, Enum
from app.db import Base
from sqlalchemy.orm import relationship 
from datetime import datetime
import uuid
import enum

# User Model  
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    gender = Column(String, nullable=True)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    
    directories = relationship("Directory", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.user_id}, name='{self.username}')>"

# Directory Model (Self-Referencing)  
class Directory(Base):
    __tablename__ = "directories"
    
    dir_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dir_name = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    parent_id = Column(String(36), ForeignKey("directories.dir_id"), nullable=True)
    color = Column(String(7), default="#99e810")
    
    # Relationships
    user = relationship("User", back_populates="directories")
    parent = relationship("Directory", remote_side=[dir_id], back_populates="children")
    children = relationship("Directory", back_populates="parent", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="directory", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Directory(id={self.dir_id}, name={self.dir_name}, user_id={self.user_id})>"

# Document Model (Belongs to a Directory)  
class Document(Base):
    __tablename__ = "documents"
    
    doc_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_name = Column(String(50), unique=True, nullable=False)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    directory_id = Column(String(36), ForeignKey("directories.dir_id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    directory = relationship("Directory", back_populates="documents")
    
    def __repr__(self):
        return f"<Document(id={self.doc_id}, name='{self.doc_name}', directory_id='{self.directory_id}')>"
    
    
    
class PermissionType(enum.Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    

class AccessDocument(Base):
    __tablename__ = "access_documents"
    
    access_doc_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String(36), ForeignKey("documents.doc_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    permission_type = Column(String(20), nullable=False, default="read")
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    
    __table_args__ = (
        CheckConstraint("permission_type IN ('read', 'write', 'admin')", name='valid_permission_type'),
        UniqueConstraint('doc_id', 'user_id', name='unique_doc_user_access')
    )
    
    # Relationships
    document = relationship("Document", backref="access_grants")
    user = relationship("User", backref="document_access")
