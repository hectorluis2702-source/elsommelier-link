import sys
from pptx import Presentation
p=Presentation(sys.argv[1])
for s in p.slides:
    for sh in s.shapes:
        if sh.has_text_frame:
            for para in sh.text_frame.paragraphs:
                for r in para.runs:
                    if r.text.startswith('Source:'): r.text=r.text.replace('Source:','Fuente:',1)
                    if r.text.startswith('Sources:'): r.text=r.text.replace('Sources:','Fuentes:',1)
                    if r.text.startswith('Note:'): r.text=r.text.replace('Note:','Nota:',1)
p.save(sys.argv[1])
p=Presentation(sys.argv[1])
for s in p.slides:
    for sh in list(s.shapes):
        if not sh.has_text_frame: continue
        t=sh.text_frame.text
        if t.strip()=='NEXT STEPS':
            sh._element.getparent().remove(sh._element); continue
        if t.startswith('Population:'):
            para=sh.text_frame.paragraphs[0]; runs=para.runs
            runs[0].text='Base: examen teórico, Unidad 1, Parte 1 · Specification 2.0.1 (2023) · Distribución oficial fija'
            for r in runs[1:]: r.text=''
p.save(sys.argv[1])
