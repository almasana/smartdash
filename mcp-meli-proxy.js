#!/usr/bin/env node

/**
 * Proxy HTTP simple para Mercado Libre MCP
 * Reenvía peticiones JSON-RPC al servidor remoto con autenticación
 */

import { createServer } from 'http';
import { fetch } from 'undici';

const MELI_MCP_URL = 'https://mcp.mercadolibre.com/mcp';
const ACCESS_TOKEN = 'APP_USR-6232687150071082-021209-1c087d3b839dfc44449799028e9298970-59925004';
const PORT = 3456;

const server = createServer(async (req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const response = await fetch(MELI_MCP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
                body: body,
            });

            const data = await response.text();

            res.writeHead(response.status, {
                'Content-Type': 'application/json',
            });
            res.end(data);
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
        }
    });
});

server.listen(PORT, () => {
    console.error(`Mercado Libre MCP Proxy escuchando en http://localhost:${PORT}`);
});
