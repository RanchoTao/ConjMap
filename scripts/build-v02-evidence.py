"""Rebuild evidence indexes from retained sources plus explicitly authored audit notes.
No network calls, model calls, proof checking, or status promotion.
"""
import hashlib
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'data/upstream/formal-conjectures'
def read(path):return json.loads((ROOT/path).read_text(encoding='utf8'))
def write(path,value):(ROOT/path).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')

def build():
    problems=read('data/problems.json');registry=read('data/v02/id-registry.json');by_id={p['id']:p for p in problems}
    notes=read('data/v02/audit-notes.json')
    reviews=[];dossiers=[]
    for note in notes:
        p=by_id[note['legacy_id']]
        dossier={'id':f"audit-{registry[p['id']]}",'problem_id':registry[p['id']],'title':p['title'],'statement':p['statement'],'formal_statement':p['formal_statement'],'source_path':p['provenance']['path'],'source_sha256':p['provenance']['sha256'],'scope_review':note['scope'],'findings':note['finding'],'search_query':note['query'],'literature_leads':note['leads'],'literature_access':'metadata/abstract unless specifically noted; no exhaustive review claimed','original_reference_status':note['original'],'source_urls':p['source_urls'],'reviewed_at':'2026-10-15','formal_systems':{'Lean':'Source declaration present; typecheck, full assumptions and axioms not independently checked.','Coq':'UNKNOWN'},'current_status':'unknown','human_review':'pending','completion':'PARTIAL','gaps':['Current primary literature and all competing proof claims need full-method review.','Formalization fidelity, source attribution and original bibliographic priority require independent review.']}
        dossiers.append(dossier)
        reviews.append({'id':f"review-{registry[p['id']]}-v1",'problem_id':registry[p['id']],'version':1,'supersedes':None,'reviewer':'Codex source-scope audit; not an independent human expert','method':'agent_source_review','human_approval':'pending','approval_receipt':None,'reviewed_at':'2026-10-15','dimensions':{'SOURCE_IMPORTED':'established','STATEMENT_CHECKED':'pending','LITERATURE_REVIEWED':'pending','MATHEMATICAL_RELATION_VERIFIED':'not_run','FORMAL_STATEMENT_CHECKED':'not_run','PROOF_KERNEL_VERIFIED':'not_run','HUMAN_REVIEW_PENDING':'pending'},'source_urls':[p['source_urls'][0],*note['leads']],'scope':note['scope'],'limitations':[note['finding'],*dossier['gaps']],'status_recommendation':'unknown','statement_sha256':hashlib.sha256(p['statement'].encode()).hexdigest()})
    write('data/v02/dossiers.json',dossiers);write('data/v02/review-events.json',reviews)
    specs=[
      ('bealconjecture','flt_of_beal_conjecture','implies','logic','forward','Positive natural bases and common exponent n>2; primitive rescaling required.','Source contains an explicit implication proof; this build has not kernel-checked it.'),
      ('abc','abc','equivalent','logic','forward','For every epsilon>0, coprime positive triples a+b=c; constants may depend on epsilon.','Finite-exception and constant-bound formulations; equivalence needs both directions and exponent/constant audit.'),
      ('abc','abc.variants.quality','equivalent','logic','forward','Coprime positive triples; logarithm/zero denominators and epsilon quantifiers must match.','Quality formulation; no proof of equivalence is accepted from co-location.'),
      ('exponentials','two_pow_three_pow_transcendental','implies','logic','forward','Irrational real t; Q-linear independence of 1,t and of log 2,log 3.','Upstream explicitly states this consequence; transcendence argument still awaits independent review.'),
      ('unionclosed','union_closed.variants.yu','implies','logic','forward','Finite union-closed family on nonempty ground type; same excluded family; 0.38234<=1/2.','Relaxed frequency conclusion; source report is not a verification of the sharp bound or recent improvements.'),
      ('unionclosed','union_closed.variants.univ_card','special_case_of','special_cases','reverse','Same family assumptions plus finite ground set cardinality <=12.','Restricted ground-set case; its truth does not establish the general conjecture.'),
      ('unionclosed','union_closed.variants.family_card','special_case_of','special_cases','reverse','Same family assumptions plus the exact family-cardinality bound in the source declaration.','Read the declaration for its bound; do not substitute ground-set size for family size.'),
      ('unionclosed','union_closed.variants.univ_card_two','special_case_of','special_cases','reverse','Ground type Fin 2 and all family assumptions in the declaration.','Finite two-element ground-set case; candidate source relation, not a universal solution.'),
      ('unionclosed','union_closed.variants.singleton_mem','special_case_of','special_cases','reverse','Union-closed family containing a singleton, with exact nonempty assumptions in source.','Additional singleton assumption is essential; does not cover arbitrary families.'),
      ('resolutionofsingularities','resolution_of_singularities_of_topologicalKrullDim_le_three','special_case_of','special_cases','reverse','Perfect field of positive characteristic, integral separated finite-type scheme, dimension <=3.','Source specialization; field/perfectness and scheme hypotheses need correspondence review.'),
      ('buchi','buchi_problem','generalizes','special_cases','reverse','The existential M formulation versus the specifically selected M=5 integer-offset formulation.','M=5 would supply an existential witness, but an arbitrary existential M does not imply M=5.'),
      ('riemannhypothesis','generalized_riemann_hypothesis','generalizes','logic','reverse','Primitive Dirichlet characters with nontrivial zeros excluded; q=1 specializes to zeta.','Source includes implies_riemannHypothesis test; this is Dirichlet GRH, not Dedekind/Kummer hypotheses for Artin.'),
    ]
    claims=[];relations=[]
    for index,(suffix,name,kind,layer,direction,hypotheses,scope) in enumerate(specs):
        p=next(p for p in problems if p['id'].endswith('-'+suffix));text=(BASE/p['provenance']['path']).read_text(encoding='utf8')
        match=re.search(r'\b(?:theorem|lemma)\s+'+re.escape(name)+r'(?=\s|[:(])',text)
        if not match:raise ValueError(name)
        end=text.find(':=',match.end());start=match.start();line=text.count('\n',0,start)+1;endline=text.count('\n',0,end)+1
        formal=text[start:end].strip();cid=f'claim-v02-{index+1:02d}';url=p['source_urls'][0].split('#')[0]+f'#L{line}-L{endline}'
        claims.append({'id':cid,'parent_id':registry[p['id']],'title':name,'field':p['field'],'formal_statement':formal,'source_path':p['provenance']['path'],'source_sha256':p['provenance']['sha256'],'start_line':line,'end_line':endline,'url':url,'review_status':'unverified','is_problem_count':False})
        relations.append({'id':f'relation-v02-{index+1:02d}','source_id':registry[p['id']] if direction=='forward' else cid,'target_id':cid if direction=='forward' else registry[p['id']],'type':kind,'layer':layer,'hypotheses':[hypotheses],'scope':scope,'evidence_url':url,'source_revision':p['provenance']['revision'],'locator':name,'review_date':'2026-10-15','review_status':'source_reviewed','reviewer':'Codex scoped source inspection; human review pending','proof_receipt':None,'human_approval':'pending','is_candidate':True})
    write('data/v02/claims.json',claims);write('data/v02/relations.json',relations)
    lines=['# Mathematical audit V0.2','', '**30 scoped dossiers; 0 fully cleared mathematical-status reviews. All 30 remain PARTIAL and HUMAN_REVIEW_PENDING.** This report records actual source-scope inspection and bounded primary-source searches, not independent peer review. Abstracts and source tags are not accepted proofs. No claim is promoted to solved.','', 'The exact statements/signatures, pinned source hashes, search queries, dated findings and individual open obligations are machine-readable in `data/v02/dossiers.json`. Review changes append versioned events; original V0.1 records are retained.','', '## Evidence dimensions','', 'SOURCE_IMPORTED is established; STATEMENT_CHECKED and LITERATURE_REVIEWED remain pending because hypothesis/definition correspondence and competing full proofs have not been independently cleared. FORMAL_STATEMENT_CHECKED and PROOF_KERNEL_VERIFIED are NOT_RUN. HUMAN_REVIEW_PENDING is explicit. There is no aggregate verified flag.','']
    for i,d in enumerate(dossiers):
        lines.extend([f"## {i+1}. {d['title']} · {d['problem_id']}",'',f"**Result: PARTIAL / status unknown / human review pending.**",'',f"Scope and quantifiers: {d['scope_review']}",'',f"Findings: {d['findings']}",'',f"Original attribution: {d['original_reference_status']}",'',f"Search executed: `{d['search_query']}`. Scope: pinned declaration/context and bounded primary-source web query on 2026-10-15; no exhaustive or full-method review claimed.",'',f"[Pinned source and exact statement]({d['source_urls'][0]}). Formalization: Lean declaration found; no new Lean/Coq execution. Source SHA-256 `{d['source_sha256']}`.",'','Literature leads inspected at metadata/abstract level: '+('; '.join(f'[{u}]({u})' for u in d['literature_leads']) or 'No adequate primary result retained; search did not establish current status.'),'','Unclosed obligations: '+' '.join(d['gaps']),''])
    lines.extend(['## Mathematical relations','',f'{len(relations)} substantive source-bound **candidates**, 0 independently verified. Exact endpoints, direction, hypotheses, source version and locator are in `data/v02/relations.json`; source statement nodes are not counted as new independent problems. Co-location never establishes equivalence. Candidates are excluded from the verified graph layer.','', '## Completion gap','', 'The intake target of 30 dossiers is covered. The target of 30 rigorous, independently cleared dossiers is not met: all 30 need further full-method/hypothesis and expert review. Strong mathematical relation verification and proof-kernel checks remain unexecuted. No fabricated theorem, bibliographic priority or status is used to fill this gap.'])
    (ROOT/'docs/mathematical-audit-v0.2.md').write_text('\n'.join(lines)+'\n',encoding='utf8',newline='\n')
    return len(dossiers),len(claims)

if __name__=='__main__':print(build())
