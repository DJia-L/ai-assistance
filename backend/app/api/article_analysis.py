from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

from app.services.article_analysis_service import get_article_analysis_service

# 定义路由
router = APIRouter(
    prefix="/api/article-analysis",
    tags=["稿件分析"],
    responses={404: {"description": "Not found"}},
)

# 总体统计API
@router.get("/stats")
def get_overall_statistics(
    days: int = Query(30, description="Days to include in statistics"),
    service = Depends(get_article_analysis_service)
) -> Dict[str, Any]:
    """获取总体统计数据，包括文章总数、各平台分布、各主题分布、总阅读量、总互动量等"""
    return service.get_overall_statistics(days)

# 员工绩效统计API
@router.get("/employee-stats")
def get_employee_statistics(
    days: int = Query(30, description="Days to include in statistics"),
    top_n: int = Query(5, description="Number of top employees to return"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """获取员工统计数据，包括每个员工的文章数量、阅读量、互动量等"""
    return service.get_employee_statistics(days, top_n)

# 部门绩效统计API
@router.get("/department-stats")
def get_department_statistics(
    days: int = Query(30, description="Days to include in statistics"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """获取部门统计数据，包括每个部门的文章数量、阅读量、互动量等"""
    return service.get_department_statistics(days)

# 平台绩效统计API
@router.get("/platform-stats")
def get_platform_statistics(
    days: int = Query(30, description="Days to include in statistics"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """获取平台统计数据，包括每个平台的文章数量、阅读量、互动量等"""
    return service.get_platform_statistics(days)

# 趋势数据API
@router.get("/trend-data")
def get_trend_data(
    days: int = Query(30, description="Days to include in trend data"),
    interval: str = Query("day", description="Interval for trend data (day, week, month)"),
    service = Depends(get_article_analysis_service)
) -> Dict[str, Any]:
    """获取趋势数据，包括一段时间内的文章数量、阅读量、互动量等变化趋势"""
    return service.get_trend_data(days, interval)

# 文章详情API
@router.get("/{article_id}")
def get_article_detail(
    article_id: str,
    service = Depends(get_article_analysis_service)
) -> Dict[str, Any]:
    """获取文章详情"""
    # 实际项目中实现这个方法
    # 目前简单返回一个固定的响应
    return {
        "id": article_id,
        "title": "示例文章标题",
        "content": "这是文章的内容...",
        "employee_name": "张三",
        "department": "新闻部",
        "platform_name": "微信公众号",
        "topic": "科技",
        "publish_date": "2023-01-05",
        "views": 15000,
        "interactions": 450,
        "quality_score": 4.8,
        "is_original": True,
        "analysis": {
            "readability_score": 85,
            "sentiment_score": 0.75,
            "keyword_density": {
                "人工智能": 5,
                "技术": 8,
                "未来": 3
            },
            "completion_rate_est": 72
        }
    }

# 员工文章列表API
@router.get("/employee-articles/{employee_id}")
def get_employee_articles(
    employee_id: str,
    days: int = Query(30, description="Days to include"),
    limit: int = Query(10, description="Number of articles to return"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """获取指定员工的文章列表"""
    # 实际项目中实现这个方法
    # 目前简单返回一个固定的响应
    return [
        {
            "id": "1",
            "title": "5G技术如何改变我们的生活",
            "platform_name": "微信公众号",
            "topic": "科技",
            "publish_date": "2023-01-05",
            "views": 15000,
            "interactions": 450,
            "quality_score": 4.8
        },
        {
            "id": "7",
            "title": "人工智能如何应用于传媒行业",
            "platform_name": "微信公众号",
            "topic": "科技",
            "publish_date": "2023-01-11",
            "views": 9500,
            "interactions": 285,
            "quality_score": 4.2
        }
    ]

# 热门文章API
@router.get("/top-articles")
def get_top_articles(
    days: int = Query(30, description="Days to include"),
    limit: int = Query(10, description="Number of articles to return"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """获取热门文章列表"""
    return service.get_top_articles(days, limit)

# 内容长度分析API
@router.get("/content-length-analysis")
def get_content_length_analysis(
    days: int = Query(30, description="Days to include in analysis"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """分析内容长度与阅读量的关系"""
    return service.get_content_length_analysis(days)

# 员工比较API
@router.get("/employee-comparison")
def compare_employees(
    employee_ids: List[str] = Query(..., description="Employee IDs to compare"),
    days: int = Query(30, description="Days to include in comparison"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """比较多个员工的绩效"""
    return service.get_employee_comparison(employee_ids, days)

# 文章搜索API
@router.get("/search")
def search_articles(
    query: str = Query(..., description="Search query"),
    days: int = Query(30, description="Days to include in search"),
    limit: int = Query(20, description="Number of results to return"),
    service = Depends(get_article_analysis_service)
) -> List[Dict[str, Any]]:
    """搜索文章"""
    return service.search_articles(query, days, limit)

# 稿件来源统计API
@router.get("/media-source-stats")
def get_media_source_statistics(
    days: int = Query(30, description="Days to include in statistics"),
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    service = Depends(get_article_analysis_service)
) -> Dict[str, Any]:
    """获取稿件来源统计数据，分析员工在各个媒体平台的发布情况"""
    return service.get_media_source_statistics(days, employee_id) 