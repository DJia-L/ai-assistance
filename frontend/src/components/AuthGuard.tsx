import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../utils/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const publicPaths = ['/login', '/register'];

  useEffect(() => {
    // 检查当前路径是否需要认证
    const pathIsPublic = publicPaths.includes(router.pathname);
    
    if (!isAuthenticated() && !pathIsPublic) {
      // 如果需要认证但未登录，重定向到登录页
      router.push(`/login?redirect=${router.pathname}`);
    } else if (isAuthenticated() && pathIsPublic) {
      // 如果已登录但访问登录/注册页，重定向到首页
      router.push('/chat');
    }
  }, [router.pathname]);

  return <>{children}</>;
} 