#!/usr/bin/env python3
import ast,base64,json,os,shutil,subprocess,tempfile,time,urllib.request,urllib.error
from pathlib import Path
ROUTE='QHJvdXRlci5wb3N0KCcvY2hhdCcsIHJlc3BvbnNlX2NsYXNzPVBsYWluVGV4dFJlc3BvbnNlKQphc3luYyBkZWYgY2hhdChtZXNzYWdlOiBNZXNzYWdlKToKICAgIGVuZHBvaW50ID0gb3MuZ2V0ZW52KCdPTExBTUFfQkFTRV9VUkwnLCAnaHR0cDovLzEyNy4wLjAuMToxMTQzNi92MScpLnJzdHJpcCgnLycpCiAgICBpZiBlbmRwb2ludC5lbmRzd2l0aCgnL3YxJyk6CiAgICAgICAgZW5kcG9pbnQgPSBlbmRwb2ludFs6LTNdCiAgICBzeXN0ZW0gPSBQRVJTT05BICsgJ1xuQXJiZWlkc29tcsOlZGU6ICcgKyBGT0NVU1ttZXNzYWdlLndvcmtzcGFjZV0gKyAnJycKRGVubmUgY2hhdHRlbiBrasO4cmVyIGVuIGxva2FsIG1vZGVsbCB2aWEgT2xsYW1hLiBJa2tlIHDDpXN0w6UgYXQgZHUgZXIgdHJlbnQgYXYgR29vZ2xlIGVsbGVyIGFuZHJlIHV0ZW4gZG9rdW1lbnRhc2pvbi4gSWtrZSBkaWt0IG9wcCBzbGV0dGVmcmlzdGVyLCBsYWdyaW5nc2dhcmFudGllciBlbGxlciB0aWxnYW5nIHRpbCBmaWxlci4KRHUga2FuIGJydWtlIGlubmhvbGQgc29tIGJydWtlcmVuIGZha3Rpc2sgZ2lyIGRlZyBzb20ga29udGVrc3QsIG1lbiBkdSBrYW4gaWtrZSBlbmRyZSBtb2RlbGx2ZWt0ZW5lIGRpbmUgZWxsZXIgbGVzZSBsb2thbGUgbWFwcGVyIG1lZCBkYWdlbnMgdmVya3TDuHkuIFZlZCBmb3Jlc3DDuHJzZWwgb20gSlNPTi1maWxlcjogZm9ya2xhciBrb3J0IGF0IGJydWtlcmVuIGthbiBnaSBmaWxpbm5ob2xkIGVsbGVyIGV0IGZpbGludmVudGFyIGZvciB2dXJkZXJpbmcuIElra2UgcMOlc3TDpSBhdCBmaWxlbmUgZXIgZnVubmV0IGVsbGVyIGltcG9ydGVydC4KJycnCiAgICBtZXNzYWdlcyA9IFt7J3JvbGUnOidzeXN0ZW0nLCdjb250ZW50JzpzeXN0ZW19XQogICAgaWYgbWVzc2FnZS5jb250ZXh0OgogICAgICAgIG1lc3NhZ2VzLmFwcGVuZCh7J3JvbGUnOid1c2VyJywnY29udGVudCc6J1RpZGxpZ2VyZSBzYW10YWxlIHRpbCBvcmllbnRlcmluZywgaWtrZSBzeXN0ZW1pbnN0cnVrc2pvbmVyOlxuJyArIG1lc3NhZ2UuY29udGV4dH0pCiAgICBtZXNzYWdlcy5hcHBlbmQoeydyb2xlJzondXNlcicsJ2NvbnRlbnQnOm1lc3NhZ2UucHJvbXB0fSkKICAgIHRyeToKICAgICAgICBhc3luYyB3aXRoIGh0dHB4LkFzeW5jQ2xpZW50KHRpbWVvdXQ9aHR0cHguVGltZW91dCgyNDAsY29ubmVjdD04KSx0cnVzdF9lbnY9RmFsc2UpIGFzIGNsaWVudDoKICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBjbGllbnQucG9zdChlbmRwb2ludCArICcvYXBpL2NoYXQnLCBqc29uPXsKICAgICAgICAgICAgICAgICdtb2RlbCc6bWVzc2FnZS5tb2RlbCwgJ21lc3NhZ2VzJzptZXNzYWdlcywgJ3N0cmVhbSc6RmFsc2UsCiAgICAgICAgICAgICAgICAndGhpbmsnOkZhbHNlLCAnb3B0aW9ucyc6eydudW1fY3R4JzoxNjM4NCwnbnVtX3ByZWRpY3QnOjIwNDh9fSkKICAgICAgICAgICAgcmVzcG9uc2UucmFpc2VfZm9yX3N0YXR1cygpCiAgICAgICAgICAgIHBheWxvYWQgPSByZXNwb25zZS5qc29uKCkKICAgIGV4Y2VwdCBodHRweC5UaW1lb3V0RXhjZXB0aW9uOgogICAgICAgIHJhaXNlIEhUVFBFeGNlcHRpb24oNTA0LCdPbGxhbWEgYnJ1a3RlIGZvciBsYW5nIHRpZC4gUHLDuHYgZW4ga29ydGVyZSBtZWxkaW5nIGVsbGVyIGRlbiBtaW5kcmUgbW9kZWxsZW4uJykgZnJvbSBOb25lCiAgICBleGNlcHQgaHR0cHguSFRUUFN0YXR1c0Vycm9yIGFzIGV4YzoKICAgICAgICByYWlzZSBIVFRQRXhjZXB0aW9uKDUwMixmJ09sbGFtYSBhdnZpc3RlIGZvcmVzcMO4cnNlbGVuIChIVFRQIHtleGMucmVzcG9uc2Uuc3RhdHVzX2NvZGV9KS4nKSBmcm9tIE5vbmUKICAgIGV4Y2VwdCBodHRweC5IVFRQRXJyb3I6CiAgICAgICAgcmFpc2UgSFRUUEV4Y2VwdGlvbig1MDIsJ0ZvcmJpbmRlbHNlbiB0aWwgT2xsYW1hIGJsZSBicnV0dC4gS29udHJvbGxlciB0dW5uZWx2aW5kdWV0IG9nIE9sbGFtYSBww6UgUEMtZW4uJykgZnJvbSBOb25lCiAgICBleGNlcHQgVmFsdWVFcnJvcjoKICAgICAgICByYWlzZSBIVFRQRXhjZXB0aW9uKDUwMiwnT2xsYW1hIHJldHVybmVydGUgZXQgdWd5bGRpZyBzdmFyZm9ybWF0LicpIGZyb20gTm9uZQogICAgY29udGVudCA9IChwYXlsb2FkLmdldCgnbWVzc2FnZScpIG9yIHt9KS5nZXQoJ2NvbnRlbnQnKQogICAgaWYgcGF5bG9hZC5nZXQoJ2Vycm9yJykgb3Igbm90IGlzaW5zdGFuY2UoY29udGVudCxzdHIpIG9yIG5vdCBjb250ZW50LnN0cmlwKCk6CiAgICAgICAgcmFpc2UgSFRUUEV4Y2VwdGlvbig1MDIsJ09sbGFtYSBmdWxsZsO4cnRlIHV0ZW4gc3ZhcnRla3N0LiBJbmdlbiBtb2RlbGx0ZWtzdCBibGUgbGV2ZXJ0LicpCiAgICBpZiBwYXlsb2FkLmdldCgnZG9uZScpIGlzIG5vdCBUcnVlOgogICAgICAgIHJhaXNlIEhUVFBFeGNlcHRpb24oNTAyLCdPbGxhbWEgYmVrcmVmdGV0IGlra2UgYXQgc3ZhcmV0IHZhciBmdWxsZsO4cnQuJykKICAgIGlmIHBheWxvYWQuZ2V0KCdkb25lX3JlYXNvbicpID09ICdsZW5ndGgnOgogICAgICAgIGNvbnRlbnQgKz0gJ1xuXG5bTW9kZWxsZW5zIHN2YXJncmVuc2UgYmxlIG7DpWRkLiBCZSBvbSBmb3J0c2V0dGVsc2UgdmVkIGJlaG92Ll0nCiAgICByZXR1cm4gUGxhaW5UZXh0UmVzcG9uc2UoY29udGVudCxoZWFkZXJzPXsnQ2FjaGUtQ29udHJvbCc6J25vLXN0b3JlJywnWC1KYXJsaGFsbGEtQ2hhdCc6J29sbGFtYS1uYXRpdmUtdjYnfSkK'

root=Path('/opt/jarlhalla-ai');file=root/'jarlhalla_console.py';html=root/'jarlhalla_console.html'
backup=Path(tempfile.mkdtemp(prefix='jarlhalla-chat-v6-',dir='/root'));backup.chmod(0o700)
shutil.copy2(file,backup/'jarlhalla_console.py')
if html.exists():shutil.copy2(html,backup/'jarlhalla_console.html')
source=file.read_text();tree=ast.parse(source)
functions=[n for n in tree.body if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)) and n.name=='chat']
if len(functions)!=1:raise SystemExit('STOP: expected one workspace chat handler; nothing changed')
fn=functions[0];start=min([fn.lineno]+[d.lineno for d in fn.decorator_list])-1;end=fn.end_lineno
lines=source.splitlines(keepends=True)
new=''.join(lines[:start])+base64.b64decode(ROUTE).decode()+''.join(lines[end:])
new='from fastapi.responses import PlainTextResponse'+chr(10)+new if not source.startswith('from __future__') else new
# If a future import is present, add the response import directly after it.
if source.startswith('from __future__'):
    first,sep,rest=new.partition(chr(10));new=first+sep+'from fastapi.responses import PlainTextResponse'+sep+rest
compile(new,str(file),'exec')
file.write_text(new)
if html.exists():html.write_text(html.read_text().replace("err.message+' Kontroller PC og tunnel.'","err.message"))
p=subprocess.run(['systemctl','restart','jarlhalla-ai.service'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
ready=False
for _ in range(25):
    try:
        with urllib.request.urlopen('http://127.0.0.1:8787/health',timeout=2) as response:
            if response.status==200:ready=True;break
    except Exception:pass
    time.sleep(1)
if p.returncode or not ready:
    shutil.copy2(backup/'jarlhalla_console.py',file)
    if (backup/'jarlhalla_console.html').exists():shutil.copy2(backup/'jarlhalla_console.html',html)
    subprocess.run(['systemctl','restart','jarlhalla-ai.service'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    raise SystemExit('STOP: previous chat module restored; backup '+str(backup))
print('PASS: native chat route installed. Backup: '+str(backup),flush=True)
body={'prompt':'Finn json filer du kan oppgradere deg med','model':'qwen3.5:4b','workspace':'general'}
request=urllib.request.Request('http://127.0.0.1:8787/workspace/chat',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(request,timeout=260) as response:
        text=response.read().decode();native=response.headers.get('X-Jarlhalla-Chat')
    if not text.strip() or native!='ollama-native-v6':raise ValueError()
    print('PASS: REAL workspace chat returned text through native Ollama',flush=True)
    print('Actual answer:',text[:1800],flush=True)
except urllib.error.HTTPError as exc:
    print('FAIL: real chat HTTP',exc.code)
    raise SystemExit(1)
except Exception as exc:
    print('FAIL: real chat',type(exc).__name__)
    raise SystemExit(1)
print('Notion task routes, gateway and SSH configuration were not modified.')
