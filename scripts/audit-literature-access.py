"""One bounded metadata probe per explicitly retained primary literature lead.
No crawling, full-paper/source downloads, or response-body redistribution.
Run only for an intentional dated audit; not part of offline CI.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.request
import urllib.error
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

class Metadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.fields = {}
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == 'meta' and data.get('name') in ('citation_title','citation_author','citation_date','citation_arxiv_id','citation_doi'):
            self.fields.setdefault(data['name'], []).append(data.get('content'))

def probe(url):
    if urlsplit(url).hostname not in ('arxiv.org','www.claymath.org'):
        raise ValueError('Only explicitly retained primary hosts permitted')
    row = {'url':url,'checked_at_utc':datetime.now(timezone.utc).isoformat(),'scope':'HTML metadata/abstract page only; not full-method or proof review'}
    try:
        request=urllib.request.Request(url, headers={'User-Agent':'ConjMap/0.2 bounded source audit'})
        with urllib.request.urlopen(request, timeout=12) as response:
            raw=response.read(262145)
            content_type=response.headers.get('Content-Type','unknown')
            row.update(status=response.status, final_url=response.url,content_type=content_type, bytes_read=len(raw),truncated=len(raw)>262144,sha256=hashlib.sha256(raw).hexdigest())
            if 'html' in content_type:
                parser=Metadata();parser.feed(raw.decode('utf8',errors='replace'))
                row['bibliographic_metadata']=parser.fields
            else:
                row['scope']='Bounded non-HTML response prefix only; no text extraction or full-method review'
                row['bibliographic_metadata']={}
    except urllib.error.HTTPError as error:
        row['status']=error.code
    except (OSError,TimeoutError):
        row.update(status=None,error='Transport failed within bounded access attempt; no retry')
    return row

if __name__=='__main__':
    dossiers=json.loads((ROOT/'data/v02/dossiers.json').read_text(encoding='utf8'))
    urls=sorted({url for d in dossiers for url in d['literature_leads']})
    with ThreadPoolExecutor(max_workers=3) as pool:
        rows=list(pool.map(probe,urls))
    output={'policy':'Explicit retained primary leads only; one GET, 12s timeout, 256KiB cap, no automatic retry, no response bodies retained. Unversioned leads are dated observations; SHA identifies observed page, not immutable paper version.','probes':rows}
    (ROOT/'docs/literature-access-v0.2.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
    print(json.dumps({'probes':len(rows),'http_200':sum(row.get('status')==200 for row in rows),'other':sum(row.get('status')!=200 for row in rows)}))
