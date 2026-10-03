import os
import sys
import socket
import threading
import uvicorn


def start_port_forwarder(source_port: int, target_port: int):
    """
    Forward incoming TCP connections from source_port to target_port in a background thread.
    Guarantees that whether Railway routes to 8000 or 8080, traffic reaches FastAPI.
    """
    def run_proxy():
        try:
            server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server.bind(("0.0.0.0", source_port))
            server.listen(128)
            print(f"[Port Forwarder] Listening on 0.0.0.0:{source_port} -> forwarding to 127.0.0.1:{target_port}")
            while True:
                client_sock, _ = server.accept()
                threading.Thread(target=_pipe_sockets, args=(client_sock, target_port), daemon=True).start()
        except Exception as e:
            # If port cannot be bound (already bound or permission error), ignore gracefully
            print(f"[Port Forwarder] Notice: could not bind auxiliary port {source_port}: {e}")

    def _pipe_sockets(client_sock, dest_port):
        try:
            remote_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            remote_sock.connect(("127.0.0.1", dest_port))

            def forward(src, dst):
                try:
                    while True:
                        buf = src.recv(8192)
                        if not buf:
                            break
                        dst.sendall(buf)
                except Exception:
                    pass
                finally:
                    try:
                        dst.shutdown(socket.SHUT_WR)
                    except Exception:
                        pass

            t1 = threading.Thread(target=forward, args=(client_sock, remote_sock), daemon=True)
            t2 = threading.Thread(target=forward, args=(remote_sock, client_sock), daemon=True)
            t1.start()
            t2.start()
            t1.join()
            t2.join()
        except Exception:
            pass
        finally:
            try:
                client_sock.close()
            except Exception:
                pass

    t = threading.Thread(target=run_proxy, daemon=True)
    t.start()


if __name__ == "__main__":
    raw_port = os.environ.get("PORT", "8000")
    try:
        port = int(raw_port)
    except (ValueError, TypeError):
        port = 8000

    # Ensure both 8000 and 8080 are covered regardless of which port Railway targets
    if port == 8080:
        start_port_forwarder(source_port=8000, target_port=8080)
    elif port == 8000:
        start_port_forwarder(source_port=8080, target_port=8000)
    else:
        # Custom dynamic port: forward both 8000 and 8080 to it
        start_port_forwarder(source_port=8000, target_port=port)
        start_port_forwarder(source_port=8080, target_port=port)

    print(f"Starting Uvicorn server on 0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, log_level="info")
