#!/usr/bin/env python3
"""不缓存的本地预览服务器。用法：python3 _build/serve.py [目录] [端口]
默认目录是仓库根目录，默认端口 8431。"""
import functools, http.server, os, sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else root
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8431


class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


print('serving', d, 'on', port)
http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(H, directory=d)).serve_forever()
