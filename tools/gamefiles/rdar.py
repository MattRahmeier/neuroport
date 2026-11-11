"""Leitor mínimo dos arquivos .archive (RDAR) do Cyberpunk 2077.

Formato (documentado pela comunidade / WolvenKit):
  header: 'RDAR', u32 versão, u64 indexPos, u32 indexSize, u64 debugPos, u32 debugSize, u64 tamanho
  índice: u32 fileTableOffset, u32 fileTableSize, u64 crc, u32 nFiles, u32 nSegments, u32 nDeps
          arquivos (56 bytes): u64 hash, u64 timestamp, u32 inlineSegs, u32 segStart, u32 segEnd,
                               u32 depStart, u32 depEnd, sha1[20]
          segmentos (16 bytes): u64 offset, u32 tamanhoComprimido, u32 tamanho
  segmento comprimido: 'KARK' + u32 tamanho + dados Oodle (Kraken), descomprimidos com a DLL do jogo.
"""
import ctypes, mmap, struct, os

import os as _os
# pasta do jogo: o servidor passa NEUROPORT_GAME (Steam/GOG/Epic detectados)
GAME = _os.environ.get('NEUROPORT_GAME') or r'C:\Program Files (x86)\Steam\steamapps\common\Cyberpunk 2077'
_oodle = None


def oodle():
    global _oodle
    if _oodle is None:
        _oodle = ctypes.WinDLL(os.path.join(GAME, 'bin', 'x64', 'oo2ext_7_win64.dll'))
        f = _oodle.OodleLZ_Decompress
        f.restype = ctypes.c_int64
        f.argtypes = [ctypes.c_void_p, ctypes.c_int64, ctypes.c_void_p, ctypes.c_int64,
                      ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_void_p, ctypes.c_int64,
                      ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_int64, ctypes.c_int]
    return _oodle


def fnv1a64(s):
    h = 0xCBF29CE484222325
    for b in s.encode('utf-8'):
        h ^= b
        h = (h * 0x100000001B3) & 0xFFFFFFFFFFFFFFFF
    return h


class Archive:
    def __init__(self, path):
        self.path = path
        self.f = open(path, 'rb')
        self.m = mmap.mmap(self.f.fileno(), 0, access=mmap.ACCESS_READ)
        m = self.m
        assert m[:4] == b'RDAR', 'não é um archive'
        idx_pos, = struct.unpack_from('<Q', m, 8)
        _tbl_off, _tbl_size, _crc, n_files, n_segs, _n_deps = struct.unpack_from('<IIQIII', m, idx_pos)
        p = idx_pos + 28
        self.files = {}
        for _ in range(n_files):
            h, _ts, _inl, s0, s1 = struct.unpack_from('<QQIII', m, p)
            self.files[h] = (s0, s1)
            p += 56
        self.segs = [struct.unpack_from('<QII', m, p + i * 16) for i in range(n_segs)]

    def read_segment(self, i):
        off, zsize, size = self.segs[i]
        raw = self.m[off:off + zsize]
        if zsize == size:
            return bytes(raw)
        if raw[:4] == b'KARK':
            size = struct.unpack_from('<I', raw, 4)[0]
            raw = raw[8:]
        out = ctypes.create_string_buffer(size)
        src = ctypes.create_string_buffer(bytes(raw), len(raw))
        n = oodle().OodleLZ_Decompress(src, len(raw), out, size, 1, 0, 0, None, 0, None, None, None, 0, 3)
        if n != size:
            raise IOError('falha ao descomprimir segmento')
        return out.raw

    def read(self, h):
        s0, s1 = self.files[h]
        return b''.join(self.read_segment(i) for i in range(s0, s1))
