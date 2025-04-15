from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.session import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    # 关系
    employees = relationship("Employee", back_populates="department")

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    position = Column(String, nullable=True)
    
    # 关系
    department = relationship("Department", back_populates="employees")
    articles = relationship("Article", back_populates="employee")

class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    platform_type = Column(String, nullable=True)
    url = Column(String, nullable=True)
    
    # 关系
    articles = relationship("Article", back_populates="platform")

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text, nullable=True)
    topic = Column(String, index=True, nullable=True)
    publish_date = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)
    interactions = Column(Integer, default=0)
    quality_score = Column(Float, default=0.0)
    is_original = Column(Boolean, default=True)
    
    # 外键
    employee_id = Column(Integer, ForeignKey("employees.id"))
    platform_id = Column(Integer, ForeignKey("platforms.id"))
    
    # 关系
    employee = relationship("Employee", back_populates="articles")
    platform = relationship("Platform", back_populates="articles") 