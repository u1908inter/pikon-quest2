#!/usr/bin/env python3
"""ピコーン・クエスト2 のビルド。
src/ の JS・ドット絵・BGM を 1つの HTML に まとめる。
  python3 src/build.py
出力:
  pikon-quest2.html + pikon-quest2.js   公開版（Pages 用。HTML を軽くして 中身は JS に）
  dist/pikon-quest2-single.html         公開版の 1ファイル版（配布・保存用）
  dist/pikon-quest2-debug.html          デバッグ版（dist/ は git に入れない）
"""
import base64, hashlib, os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = 'https://u1908inter.github.io/pikon-quest2/'
OG_IMAGE = SITE + 'assets/og.png'
GOATCOUNTER = '<script data-goatcounter="https://u1908inter.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>'
# 読みこむ 順番が 大事（あとで 定義される 定数を 先に さわらない）
MODULES = ['data','jobs2','weapons','stats','battle1','battle2','jobs2b','traits','maou','skills','sp2','allies','tags',
           'skills2','skills3','combos','battle3','render','town','extract','arti','sfx','solo','debug','extra','tower2',
           'demo','perks','goals','ending','campfx','qol','bgm','camp']
BGMS = ['camp','grass','forest','cave','desert','snow','hell','tower','boss','boss2','boss3','ending']

def rd(*p): return open(os.path.join(HERE, *p), encoding='utf-8').read()

def main():
  spr = rd('sprites.js')
  game = '\n'.join(rd('js', m + '.js') for m in MODULES)
  seen, lines = {}, []
  for k in BGMS:
    f = os.path.join(HERE, 'bgm', k + '.mp3')
    if not os.path.exists(f): continue
    b = open(f, 'rb').read()
    if b in seen: lines.append("BGM_SRC.%s = BGM_SRC.%s;" % (k, seen[b]))
    else: seen[b] = k; lines.append("BGM_SRC.%s = 'data:audio/mpeg;base64,%s';" % (k, base64.b64encode(b).decode()))
  game = game.replace('/*BGM_FILES*/', '\n'.join(lines))
  icon = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(HERE, 'icon.png'), 'rb').read()).decode()
  shell = rd('shell.html').replace('/*ICON*/', icon).replace('<!--OGIMG-->', '<meta property="og:image" content="%s">' % OG_IMAGE)
  def wr(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(text)
    print('wrote', os.path.relpath(path, ROOT), '%.2f MB' % (os.path.getsize(path) / 1e6))
  def single(gc, dbg):
    return shell.replace('<!--GC-->', gc).replace('/*SPRITES*/', spr).replace('/*GAME*/', game.replace('__DEBUG_MENU__', dbg))
  # 公開用（Pages）: HTML は 軽く、中身は 外部 JS に 分ける。
  # HTML が 重いと X などの リンクプレビュー（OGP）が 読まれないため。
  js = spr + '\n' + game.replace('__DEBUG_MENU__', 'false')
  ver = hashlib.sha1(js.encode('utf-8')).hexdigest()[:8]
  page = shell.replace('<!--GC-->', GOATCOUNTER).replace('<script>\n/*SPRITES*/\n/*GAME*/\n</script>', '<script src="pikon-quest2.js?v=%s"></script>' % ver)
  assert 'pikon-quest2.js?v=' in page
  wr(os.path.join(ROOT, 'pikon-quest2.js'), js)
  wr(os.path.join(ROOT, 'pikon-quest2.html'), page)
  # 1ファイル版（配布・保存用）と デバッグ版。dist/ は git に 入れない
  wr(os.path.join(ROOT, 'dist', 'pikon-quest2-single.html'), single(GOATCOUNTER, 'false'))
  wr(os.path.join(ROOT, 'dist', 'pikon-quest2-debug.html'), single('', 'true'))

if __name__ == '__main__': main()
