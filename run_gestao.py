#!/usr/bin/env python
"""Wrapper para rodar app_gestao.py em background sem fechar"""
import subprocess
import sys
import time
import socket

def port_is_open(host, port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex((host, port))
    sock.close()
    return result == 0

if __name__ == "__main__":
    print("[*] Iniciando app_gestao.py na porta 5001...")
    
    # Inicia o processo em background
    proc = subprocess.Popen(
        [sys.executable, "app_gestao.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )
    
    # Aguarda porta abrir
    for i in range(30):
        if port_is_open("127.0.0.1", 5001):
            print("[✓] Servidor está rodando na porta 5001")
            print("[*] Mantendo processo ativo... (Ctrl+C para sair)")
            try:
                proc.wait()
            except KeyboardInterrupt:
                print("\n[*] Encerrando...")
                proc.terminate()
                sys.exit(0)
            break
        time.sleep(1)
        print(f"[.] Aguardando porta 5001 ({i+1}/30)...")
    else:
        print("[✗] Falha ao iniciar servidor")
        stdout, stderr = proc.communicate()
        print("STDOUT:", stdout.decode())
        print("STDERR:", stderr.decode())
        sys.exit(1)
