from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime,ForeignKey, func
from app.db import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__="users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    gender = Column(String,nullable=True)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
