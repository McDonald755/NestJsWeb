module.exports = {
    apps: [
        {
            name: 'syncOrder-bsc',
            script: './dist/main.js',
            autorestart: true,
            watch: true,
            ignore_watch: ['access', 'app-out', 'errors'],
            watch_options: {
                usePolling: true,
            },
        },
    ],
}