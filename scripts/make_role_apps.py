"""
ساخت سه فایل HTML مستقل از روی خروجی build:
- apps/hamzaban-passenger.html  (مسافر)
- apps/hamzaban-translator.html (مترجم)
- apps/hamzaban-admin.html      (مدیریت)

برنامه‌ی اصلی نقش را از hash آدرس می‌خواند (#interpreter برای مترجم، #admin برای مدیریت).
این اسکریپت hash مناسب را پیش از اجرای برنامه تنظیم می‌کند.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "dist" / "index.html"
OUT = ROOT / "apps"

APPS = [
    ("hamzaban-passenger.html", "passenger", "هم‌زبان | مسافر", "#passenger"),
    ("hamzaban-translator.html", "interpreter", "هم‌زبان | مترجم", "#interpreter"),
    ("hamzaban-admin.html", "admin", "هم‌زبان | مدیریت", "#admin"),
]


def main():
    html = SRC.read_text(encoding="utf-8")
    OUT.mkdir(exist_ok=True)
    for filename, _role, title, hash_value in APPS:
        page = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html, count=1, flags=re.S)
        preset = (
            # دکمه‌ی تغییر نقش را پنهان می‌کند و آدرس را همیشه روی نقش این فایل نگه می‌دارد
            "<style>.v2-role-button{display:none!important}</style>"
            "<script>"
            f"(function(){{var h='{hash_value}';"
            "function fix(){if(location.hash!==h){history.replaceState(null,'',h);}}"
            "fix();window.addEventListener('hashchange',fix);})();"
            "</script>"
        )
        page = page.replace("<head>", "<head>" + preset, 1)
        (OUT / filename).write_text(page, encoding="utf-8")
        print("wrote", OUT / filename, len(page))


if __name__ == "__main__":
    main()
