from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import random

class ArticleAnalysisService:
    """稿件分析服务，提供各类稿件统计和分析功能"""
    
    def __init__(self, db=None):
        self.db = db
        # 模拟数据
        self.topics = ["政治", "经济", "科技", "文化", "社会", "体育", "国际", "娱乐"]
        self.platforms = ["微信公众号", "微博", "抖音", "今日头条", "快手", "百家号", "网站"]
        self.employees = [
            {"id": "1", "name": "张三", "department": "新闻部"},
            {"id": "2", "name": "李四", "department": "体育部"},
            {"id": "3", "name": "王五", "department": "科技部"},
            {"id": "4", "name": "赵六", "department": "文化部"},
            {"id": "5", "name": "钱七", "department": "国际部"}
        ]
        self.departments = ["新闻部", "体育部", "科技部", "文化部", "国际部"]
    
    def get_overall_statistics(self, days: int) -> Dict[str, Any]:
        """获取总体统计数据"""
        total_articles = random.randint(500, 1000)
        total_views = total_articles * random.randint(1000, 5000)
        total_interactions = int(total_views * random.uniform(0.01, 0.05))

        # 生成平台分布
        platform_distribution = []
        remaining = 100
        for i, platform in enumerate(self.platforms):
            if i == len(self.platforms) - 1:
                percentage = remaining
            else:
                percentage = random.randint(5, remaining - 5 * (len(self.platforms) - i - 1))
                remaining -= percentage
            platform_distribution.append({
                "name": platform,
                "percentage": percentage
            })

        # 生成主题分布
        topic_distribution = []
        remaining = 100
        for i, topic in enumerate(self.topics):
            if i == len(self.topics) - 1:
                percentage = remaining
            else:
                percentage = random.randint(5, remaining - 5 * (len(self.topics) - i - 1))
                remaining -= percentage
            topic_distribution.append({
                "name": topic,
                "percentage": percentage
            })
        
        return {
            "total_articles": total_articles,
            "total_views": total_views,
            "total_interactions": total_interactions,
            "quality_score_avg": round(random.uniform(3.5, 4.8), 1),
            "platform_distribution": platform_distribution,
            "topic_distribution": topic_distribution
        }
    
    def get_employee_statistics(self, days: int, top_n: int) -> List[Dict[str, Any]]:
        """获取员工统计数据"""
        result = []
        for employee in self.employees[:top_n]:
            articles_count = random.randint(10, 50)
            views = articles_count * random.randint(1000, 5000)
            interactions = int(views * random.uniform(0.01, 0.05))
            result.append({
                "id": employee["id"],
                "name": employee["name"],
                "department": employee["department"],
                "articles_count": articles_count,
                "views": views,
                "interactions": interactions,
                "quality_score_avg": round(random.uniform(3.5, 4.8), 1)
            })
        return result
    
    def get_department_statistics(self, days: int) -> List[Dict[str, Any]]:
        """获取部门统计数据"""
        result = []
        for department in self.departments:
            articles_count = random.randint(50, 200)
            views = articles_count * random.randint(1000, 5000)
            interactions = int(views * random.uniform(0.01, 0.05))
            result.append({
                "name": department,
                "articles_count": articles_count,
                "views": views,
                "interactions": interactions,
                "quality_score_avg": round(random.uniform(3.5, 4.8), 1)
            })
        return result
    
    def get_platform_statistics(self, days: int) -> List[Dict[str, Any]]:
        """获取平台统计数据"""
        result = []
        for platform in self.platforms:
            articles_count = random.randint(50, 200)
            views = articles_count * random.randint(1000, 5000)
            interactions = int(views * random.uniform(0.01, 0.05))
            result.append({
                "name": platform,
                "articles_count": articles_count,
                "views": views,
                "interactions": interactions,
                "quality_score_avg": round(random.uniform(3.5, 4.8), 1)
            })
        return result
    
    def get_trend_data(self, days: int, interval: str) -> Dict[str, Any]:
        """获取趋势数据"""
        dates = []
        articles = []
        views = []
        interactions = []

        # 根据interval生成日期
        if interval == "day":
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
                dates.insert(0, date)
                articles.insert(0, random.randint(10, 50))
                views.insert(0, random.randint(10000, 50000))
                interactions.insert(0, random.randint(500, 2000))
        elif interval == "week":
            weeks = days // 7
            for i in range(weeks):
                date = (datetime.now() - timedelta(weeks=i)).strftime("%Y-%m-%d")
                dates.insert(0, f"第{weeks-i}周")
                articles.insert(0, random.randint(50, 200))
                views.insert(0, random.randint(50000, 200000))
                interactions.insert(0, random.randint(2000, 10000))
        else:  # month
            months = days // 30
            for i in range(months):
                date = (datetime.now() - timedelta(days=i*30)).strftime("%Y-%m")
                dates.insert(0, date)
                articles.insert(0, random.randint(200, 500))
                views.insert(0, random.randint(200000, 500000))
                interactions.insert(0, random.randint(10000, 50000))
        
        return {
            "dates": dates,
            "metrics": [
                {"name": "文章数", "data": articles},
                {"name": "阅读量", "data": views},
                {"name": "互动量", "data": interactions}
            ]
        }
    
    def get_top_articles(self, days: int, limit: int) -> List[Dict[str, Any]]:
        """获取热门文章列表"""
        result = []
        titles = [
            "5G技术如何改变我们的生活", 
            "中国经济发展新趋势", 
            "人工智能如何应用于传媒行业",
            "世界杯精彩回顾",
            "新能源汽车发展前景分析",
            "电影《流浪地球》的科技解析",
            "疫情后旅游业复苏情况",
            "元宇宙：未来互联网的新形态",
            "数字人民币的发展与应用",
            "绿色低碳经济政策解读"
        ]
        
        for i in range(min(limit, len(titles))):
            result.append({
                "id": str(i+1),
                "title": titles[i],
                "employee_name": random.choice(self.employees)["name"],
                "platform_name": random.choice(self.platforms),
                "topic": random.choice(self.topics),
                "publish_date": (datetime.now() - timedelta(days=random.randint(1, days))).strftime("%Y-%m-%d"),
                "views": random.randint(5000, 50000),
                "interactions": random.randint(200, 2000),
                "quality_score": round(random.uniform(4.0, 5.0), 1)
            })
        
        # 按阅读量排序
        result.sort(key=lambda x: x["views"], reverse=True)
        return result
    
    def get_content_length_analysis(self, days: int) -> List[Dict[str, Any]]:
        """分析内容长度与阅读量的关系"""
        result = []
        length_ranges = ["0-500字", "500-1000字", "1000-2000字", "2000-3000字", "3000字以上"]
        
        for length_range in length_ranges:
            avg_views = random.randint(5000, 20000)
            avg_completion_rate = round(random.uniform(0.3, 0.9), 2)
            result.append({
                "length_range": length_range,
                "avg_views": avg_views,
                "avg_completion_rate": avg_completion_rate
            })
        
        return result
    
    def get_employee_comparison(self, employee_ids: List[str], days: int) -> List[Dict[str, Any]]:
        """比较多个员工的绩效"""
        result = []
        for employee_id in employee_ids:
            employee = next((e for e in self.employees if e["id"] == employee_id), None)
            if employee:
                articles_count = random.randint(10, 50)
                views = articles_count * random.randint(1000, 5000)
                interactions = int(views * random.uniform(0.01, 0.05))
                result.append({
                    "id": employee["id"],
                    "name": employee["name"],
                    "department": employee["department"],
                    "articles_count": articles_count,
                    "views": views,
                    "interactions": interactions,
                    "quality_score_avg": round(random.uniform(3.5, 4.8), 1),
                    "platform_distribution": [
                        {"name": platform, "percentage": random.randint(5, 30)}
                        for platform in random.sample(self.platforms, 3)
                    ]
                })
        
        return result
    
    def search_articles(self, query: str, days: int, limit: int) -> List[Dict[str, Any]]:
        """搜索文章"""
        # 模拟搜索结果
        result = []
        titles = [
            f"{query}技术如何改变我们的生活", 
            f"中国{query}发展新趋势", 
            f"{query}如何应用于传媒行业",
            f"{query}精彩回顾",
            f"新{query}发展前景分析"
        ]
        
        for i in range(min(limit, len(titles))):
            result.append({
                "id": str(i+1),
                "title": titles[i],
                "employee_name": random.choice(self.employees)["name"],
                "platform_name": random.choice(self.platforms),
                "topic": random.choice(self.topics),
                "publish_date": (datetime.now() - timedelta(days=random.randint(1, days))).strftime("%Y-%m-%d"),
                "views": random.randint(5000, 50000),
                "interactions": random.randint(200, 2000),
                "quality_score": round(random.uniform(3.5, 4.8), 1)
            })
        
        return result
    
    def get_media_source_statistics(self, days: int, employee_id: Optional[str] = None) -> Dict[str, Any]:
        """获取稿件来源统计数据"""
        result = {
            "total_articles": random.randint(100, 500),
            "platform_distribution": []
        }
        
        # 生成平台分布
        platform_distribution = []
        remaining = 100
        for i, platform in enumerate(self.platforms):
            if i == len(self.platforms) - 1:
                percentage = remaining
            else:
                percentage = random.randint(5, remaining - 5 * (len(self.platforms) - i - 1))
                remaining -= percentage
            platform_distribution.append({
                "name": platform,
                "percentage": percentage,
                "articles_count": int(result["total_articles"] * percentage / 100)
            })
        
        result["platform_distribution"] = platform_distribution
        return result

# 创建一个全局服务实例，避免每次请求都创建新的实例
_article_analysis_service = ArticleAnalysisService()

def get_article_analysis_service():
    """依赖注入函数，用于获取ArticleAnalysisService实例"""
    return _article_analysis_service 