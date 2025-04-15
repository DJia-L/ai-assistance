import React from 'react';
import styled from 'styled-components';
import { Result, Button } from 'antd';
import { useRouter } from 'next/router'; // 使用 Next.js 的路由
import BackButton from './BackButton';

interface NotFoundPageProps {
  title?: string;
  subTitle?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ 
  title = '404',
  subTitle = '抱歉，您访问的页面不存在'
}) => {
  const router = useRouter();

  return (
    <StyledNotFound>
      <Result
        status="404"
        title={title}
        subTitle={subTitle}
        extra={[
          <BackButton key="back" />,
          <Button 
            type="primary" 
            key="home"
            onClick={() => router.push('/')}
          >
            返回首页
          </Button>,
        ]}
      />
    </StyledNotFound>
  );
};

const StyledNotFound = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default NotFoundPage;