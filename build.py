"""Assemble offline pages. npm run build additionally renders LaTeX to MathML."""
from pathlib import Path
import re
HERE=Path(__file__).resolve().parent
PAGES={'index':'The idea','quantum':'Quantum states','expansion':'Cosmic expansion','relativity':'Whose now?','guide':'Field notes'}
def read(name): return (HERE/name).read_text()
def build():
    nav=read('templates/nav.html');drag=read('assets/drag.js')
    q=read('tunnel-fragment.template.html').replace('/*__MODEL__*/',read('model.js')).replace('/*__DRAG__*/',drag)
    c=read('cosmology-fragment.template.html').replace('/*__COSMOLOGY__*/',read('cosmology.js')).replace('/*__DRAG__*/',drag)
    rings=''.join(f'<ellipse cx="{100+i*50}" cy="{180-i*2}" rx="35" ry="92" stroke="#64929a" stroke-width="1" fill="none" opacity="{.85-i*.035}"/>' for i in range(16))
    for page,title in PAGES.items():
        content=read(f'templates/{page}.html')
        if page in ('quantum','expansion'): content=content.replace('/*__FRAGMENT__*/',q if page=='quantum' else c)
        content=content.replace('/*__RELATIVITY__*/',read('relativity.js')).replace('<!--__RINGS__-->',rings).replace('<main>','<main id="main">')
        assert not re.search(r'/\*__\w+__\*/',content)
        active=nav.replace(f'href="{page}.html"',f'aria-current="page" href="{page}.html"')
        head=f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="A playful thought experiment about spacetime, quantum states and cosmology, with draggable JavaScript experiments and inspectable equations."><title>Tunnel Lab · {title}</title><link rel="stylesheet" href="assets/legacy.css"><link rel="stylesheet" href="assets/app.css"></head><body><a class="skip-link" href="#main">Skip to content</a>'
        (HERE/f'{page}.html').write_text(head+active+content+'</body></html>')
    print('Assembled five offline pages.')
if __name__=='__main__': build()
