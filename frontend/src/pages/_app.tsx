import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import gsap from 'gsap';
import ImmersiveNav from '../components/ImmersiveNav';
import { preloadData } from '../utils/api';
import AuthGuard from '../components/AuthGuard';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const isHomePage = router.pathname === '/';
    const [loading, setLoading] = useState(false);

    // 页面过渡效果
    useEffect(() => {
        const handleStart = (url: string) => {
            if (url !== router.asPath) {
                setLoading(true);
            }
        };
        const handleComplete = () => {
            setLoading(false);
            
            // 添加内容淡入效果
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                gsap.fromTo(contentArea, 
                    { opacity: 0, y: 10 }, 
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.8, 
                        ease: "power3.out"
                    }
                );
            }
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);
    
    // 预加载常用数据
    useEffect(() => {
        // 检查用户是否已登录
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user.id) {
                    // 预加载用户相关数据
                    console.log('预加载用户数据');
                    preloadData(user.id);
                }
            } catch (err) {
                console.warn('解析用户数据失败', err);
            }
        }
    }, []);
    
    return (
        <>
            <Head>
                <title>融媒体AI助手</title>
                <meta name="description" content="基于DeepSeek大模型的融媒体助手系统" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link 
                  rel="stylesheet" 
                  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" 
                  integrity="sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==" 
                  crossOrigin="anonymous" 
                  referrerPolicy="no-referrer" 
                />
            </Head>
            
            <style jsx global>{`
                :root {
                    --navbar-height: 60px;
                    --page-transition: all 0.5s cubic-bezier(0.65, 0, 0.35, 1);
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    background: #f5f7fa;
                    background-image: linear-gradient(120deg, #f5f7fa 0%, #eef2f7 100%);
                    min-height: 100vh;
                    overflow-x: hidden;
                    font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                }
                
                #__next {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                }

                .app-container {
                    display: flex;
                    min-height: 100vh;
                    width: 100%;
                    position: relative;
                }

                .content-area {
                    flex: 1;
                    width: 100%;
                    transition: var(--page-transition);
                    min-height: 100vh;
                    position: relative;
                    will-change: transform;
                }
                
                .page-with-padding {
                    padding: 24px 32px;
                    height: 100%;
                    box-sizing: border-box;
                }
                
                .home-page-container {
                    padding: 0;
                }

                @media (max-width: 768px) {
                    .page-with-padding {
                        padding: 20px;
                    }
                }
                
                .loading .content-area {
                    opacity: 0.6;
                }
            `}</style>
            
            <AuthGuard>
                <div className="app-container">
                    <ImmersiveNav />
                    {/* 内容区域 */}
                    <div className="content-area">
                        <main className={isHomePage ? "home-page-container" : "page-with-padding"}>
                            <Component {...pageProps} />
                        </main>
                    </div>
                </div>
            </AuthGuard>
        </>
    );
} 