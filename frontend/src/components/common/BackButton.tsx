import React from 'react';
import { Button, Tooltip } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const BackButton: React.FC = () => {
    const router = useRouter();

    const handleBack = () => {
        router.push('/');
    };

    return (
        <Tooltip title="返回首页">
            <StyledButton
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                aria-label="返回首页"
            />
        </Tooltip>
    );
};

export default BackButton; 