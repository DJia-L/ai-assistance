import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// 模拟的屏幕组件
import HomeScreen from './screens/HomeScreen';
import ArticleAnalysisScreen from './screens/ArticleAnalysisScreen';
import HotTopicsScreen from './screens/HotTopicsScreen';
import ContentGenerationScreen from './screens/ContentGenerationScreen';
import VoiceAssistantScreen from './screens/VoiceAssistantScreen';
import ProfileScreen from './screens/ProfileScreen';

// 导航类型
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 主标签导航
const MainTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#1890ff',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: { paddingBottom: 5 }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: '首页',
                    tabBarIcon: ({ color }) => (
                        <Icon name="home" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="ArticleAnalysis"
                component={ArticleAnalysisScreen}
                options={{
                    title: '稿件分析',
                    tabBarIcon: ({ color }) => (
                        <Icon name="file-document-outline" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="HotTopics"
                component={HotTopicsScreen}
                options={{
                    title: '热点追踪',
                    tabBarIcon: ({ color }) => (
                        <Icon name="fire" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="ContentGeneration"
                component={ContentGenerationScreen}
                options={{
                    title: '内容生成',
                    tabBarIcon: ({ color }) => (
                        <Icon name="creation" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="VoiceAssistant"
                component={VoiceAssistantScreen}
                options={{
                    title: '语音助手',
                    tabBarIcon: ({ color }) => (
                        <Icon name="microphone" color={color} size={26} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: '我的',
                    tabBarIcon: ({ color }) => (
                        <Icon name="account" color={color} size={26} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// 主应用
const App = () => {
    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Main"
                        component={MainTabs}
                        options={{ headerShown: false }}
                    />
                    {/* 这里可以添加其他需要全屏显示的页面 */}
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
};

export default App; 