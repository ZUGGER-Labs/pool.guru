server 端 对各条链的 pool  position 的监控和数据抓取

# DB 初始化

drizzle:
```
npx drizzle-kit generate:pg
npx tsx src/db/migrate.ts
bun run src/db/migrate.ts
```

# Token

# Pool

定时从 graph 获取 pools 的数据，通过比较本地数据库中的 pool.txCount 与 接口获得的 pool.txCount, 如果不一致, 则更新该 pool, 并更新该 pool 下所有的 positions

# Tick

# Position

