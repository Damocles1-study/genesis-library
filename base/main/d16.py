# 第 16 步新写的代码
# ---------- 第 16 步 · 缓存：手边的小抽屉 ----------
CACHE = {}                       # 格号 → 值
SIZE = {'n': 8}                  # 抽屉最多放几格
STAT = {'hit': 0, 'miss': 0}


def cache_read(a):
    if a in CACHE:
        STAT['hit'] = STAT['hit'] + 1
        return CACHE[a]
    STAT['miss'] = STAT['miss'] + 1
    v = mem_read(a)
    if len(CACHE) >= SIZE['n']:
        oldest = list(CACHE)[0]          # 最早放进来的先请出去
        del CACHE[oldest]
    CACHE[a] = v
    return v


def cache_write(a, v):
    mem_write(a, v)
    if a in CACHE:
        CACHE[a] = mem_read(a)


def read(a):          # 同名的 def 写在后面，会盖掉前面那个
    return cache_read(a)


def write(a, v):
    cache_write(a, v)


def demo():
    for n in [4, 8]:
        SIZE['n'] = n
        CACHE.clear()
        STAT['hit'], STAT['miss'] = 0, 0
        load(COUNTDOWN)
        run()
        print(f'抽屉放 {n} 格：命中', STAT['hit'], '次，没命中', STAT['miss'], '次')
