import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/@imgly/background-removal/dist/*.wasm',
                    dest: 'assets/'
                },
                {
                    src: 'node_modules/onnxruntime-web/dist/*.wasm',
                    dest: 'assets/'
                },
            ]
        })
    ],
    optimizeDeps: {
        exclude: ['@imgly/background-removal']
    },
    server: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },
})
