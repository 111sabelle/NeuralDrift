module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleNameMapper: {
        // 路径别名
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/config/(.*)$': '<rootDir>/config/$1',
        '^@/types/(.*)$': '<rootDir>/types/$1',
        // 处理静态资源
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
        // 处理 .d.ts 文件
        '\\.d.ts$': 'jest-transform-stub'
    },
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
        '\\.d.ts$': 'jest-transform-stub'
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(@metamask|@wagmi|wagmi)/)'
    ]
};
