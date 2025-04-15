// 声明样式化组件模块
declare module 'styled-components';

// 声明媒体文件模块
declare module '*.mp4' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.png' {
    const src: string;
    export default src;
}

// 声明rc-picker模块及相关子模块
declare module 'rc-picker' {
    const content: any;
    export default content;
}

declare module 'rc-picker/es/locale/en_US' {
    const content: any;
    export default content;
} 