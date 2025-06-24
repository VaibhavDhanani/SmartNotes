from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, UniqueConstraint,CheckConstraint, Enum
from app.db import Base
from sqlalchemy.orm import relationship 
from datetime import datetime
import uuid
import enum

 
class User(Base):
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    gender = Column(String, nullable=True)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    
    directories = relationship("Directory", back_populates="user", cascade="all, delete-orphan",passive_deletes=True)
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan",passive_deletes=True)
    
    def __repr__(self):
        return f"<User(id={self.user_id}, name='{self.username}')>"

 
class Directory(Base):
    __tablename__ = "directories"
    
    dir_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dir_name = Column(String(50), nullable=False)
    is_stared = Column(Boolean, nullable=False,default=False)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    user_id = Column(Integer, ForeignKey('users.user_id',ondelete="CASCADE"), nullable=False)
    parent_id = Column(String(36), ForeignKey("directories.dir_id",ondelete="CASCADE"), nullable=True)
    color = Column(String(7), default="#99e810")
    
    # Relationships
    user = relationship("User", back_populates="directories", passive_deletes=True)
    parent = relationship("Directory", remote_side=[dir_id], back_populates="children", passive_deletes=True)
    children = relationship("Directory", back_populates="parent", cascade="all, delete-orphan", passive_deletes=True)
    documents = relationship("Document", back_populates="directory", cascade="all, delete-orphan", passive_deletes=True)

    __table_args__ = (
        UniqueConstraint("user_id", "dir_name", name="unique_user_dir_name"),
    )
    def __repr__(self):
        return f"<Directory(id={self.dir_id}, name={self.dir_name}, user_id={self.user_id})>"

  
class Document(Base):
    __tablename__ = "documents"
    
    doc_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_name = Column(String(50), nullable=False)
    content = Column(Text, nullable=True)
    is_stared = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    user_id = Column(Integer, ForeignKey("users.user_id",ondelete="CASCADE"), nullable=False)
    directory_id = Column(String(36), ForeignKey("directories.dir_id",ondelete="CASCADE"), nullable=False)
    
    user = relationship("User", back_populates="documents")
    directory = relationship("Directory", back_populates="documents")

    __table_args__ = (
        UniqueConstraint('user_id', 'directory_id', 'doc_name', name='unique_user_doc_name'),
    )
    
    def __repr__(self):
        return f"<Document(id={self.doc_id}, name='{self.doc_name}', directory_id='{self.directory_id}')>"
    
    
    
class PermissionType(enum.Enum):
    VIEW = "view"
    EDIT = "edit"
    OWNER = "owner"
    

class AccessDocument(Base):
    __tablename__ = "access_documents"
    
    access_doc_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    doc_id = Column(String(36), ForeignKey("documents.doc_id",ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id",ondelete="CASCADE"), nullable=False)
    permission = Column(String(20), nullable=False, default="view")
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    
    __table_args__ = (
        CheckConstraint("permission IN ('view', 'edit', 'owner')", name='valid_permission_type'),
        UniqueConstraint('doc_id', 'user_id', name='unique_doc_user_access')
    )
    
    
    document = relationship("Document", backref="access_grants")
    user = relationship("User", backref="document_access")
