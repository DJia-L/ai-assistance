import requests
import json

# API 配置
api_key = "sk-08943f26f4374dc0b122f8ede6144b1d"
base_url = "https://api.deepseek.com"
endpoint = "/v1/chat/completions"

# 请求头
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# 请求体
data = {
    "model": "deepseek-chat",
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7,
    "max_tokens": 2000,
    "stream": False
}

# 发送请求
try:
    print(f"发送请求到 {base_url}{endpoint}")
    print(f"API密钥: {api_key[:5]}...{api_key[-5:]}")
    print(f"请求体: {json.dumps(data, ensure_ascii=False)}")
    
    response = requests.post(
        f"{base_url}{endpoint}",
        headers=headers,
        json=data,
        timeout=30
    )
    
    print(f"状态码: {response.status_code}")
    print(f"响应头: {response.headers}")
    
    if response.status_code == 200:
        response_json = response.json()
        print(f"响应体: {json.dumps(response_json, ensure_ascii=False, indent=2)}")
        
        if "choices" in response_json and len(response_json["choices"]) > 0:
            content = response_json["choices"][0]["message"]["content"]
            print(f"AI回复: {content}")
        else:
            print("响应格式异常，没有找到 choices 字段")
    else:
        print(f"错误响应: {response.text}")
        
except Exception as e:
    print(f"发生错误: {str(e)}") 