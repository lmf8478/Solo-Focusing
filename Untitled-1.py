from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import functools
import webbrowser


project_folder = Path(__file__).resolve().parent
handler = functools.partial(SimpleHTTPRequestHandler, directory=str(project_folder))
server = ThreadingHTTPServer(("localhost", 0), handler)
port = server.server_address[1]
website_url = f"http://localhost:{port}"

print(f"Focus timer running at {website_url}")
print("Press Ctrl+C to stop the website.")
webbrowser.open(website_url)

try:
	server.serve_forever()
except KeyboardInterrupt:
	print("\nWebsite stopped.")
finally:
	server.server_close()
